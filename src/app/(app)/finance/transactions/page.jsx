// src/app/(app)/finance/transactions/page.jsx
"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  Plus,
  List,
  PieChart,
  ArrowLeft,
  FileSpreadsheet,
} from "lucide-react";
import FilterBar from "@/modules/finance/components/FilterBar";
import TransactionsTable from "@/modules/finance/components/TransactionsTable";
import AnalyticsDashboard from "@/modules/finance/components/AnalyticsDashboard";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/ui/skeleton";
import { resolveRange } from "@/modules/finance/lib/dates";
import { invalidateFinanceCache } from "@/modules/finance/lib/cache";
import { cn } from "@/core/utils/cn";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<TransactionsSkeleton />}>
      <TransactionsInner />
    </Suspense>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8">
      <SkeletonTable rows={8} />
    </div>
  );
}

function TransactionsInner() {
  const params = useSearchParams();
  const now = new Date();
  const initialView = params.get("view") === "analytics" ? "analytics" : "table";

  const [view, setView] = useState(initialView);
  const [filters, setFilters] = useState({
    preset: "this-month",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    from: "",
    to: "",
    type: "",
    search: "",
  });
  const [sort, setSort] = useState({ sortBy: "date", sortDir: "desc" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { from, to } = useMemo(() => resolveRange(filters), [filters]);

  // Transactions query
  const txKey = useMemo(() => {
    const p = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
      limit: "200",
    });
    if (filters.type) p.set("type", filters.type);
    if (filters.search) p.set("search", filters.search);
    return `/api/finance/transactions?${p}`;
  }, [from, to, filters.type, filters.search]);

  const { data: txData, isLoading: txLoading, mutate: mutateTx } = useSWR(txKey, {
    keepPreviousData: true,
  });

  // Reports query (analytics)
  const reportsKey = useMemo(() => {
    const p = new URLSearchParams({
      range: "custom",
      from: from.toISOString(),
      to: to.toISOString(),
    });
    if (filters.type) p.set("type", filters.type);
    return `/api/finance/reports?${p}`;
  }, [from, to, filters.type]);

  const { data: reports, isLoading: reportsLoading } = useSWR(reportsKey, {
    keepPreviousData: true,
  });

  const transactions = txData?.transactions ?? [];

  // Local totals for header
  const summary = useMemo(
    () =>
      transactions.reduce(
        (a, t) => {
          const amt = Number(t.amount);
          if (t.type === "income") a.totalIncome += amt;
          else a.totalExpense += amt;
          return a;
        },
        { totalIncome: 0, totalExpense: 0 }
      ),
    [transactions]
  );
  summary.netSavings = summary.totalIncome - summary.totalExpense;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/finance/transactions/${confirmDelete.id}`, {
        method: "DELETE",
      });
      await invalidateFinanceCache();
      mutateTx();
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Transactions"
        description="Every credit and debit in one place"
        breadcrumbs={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions" },
        ]}
        actions={
          <Link href="/finance/transactions/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </Link>
        }
      />

      {/* View toggle */}
      <div className="mt-6 flex items-center gap-2">
        <div className="flex rounded-lg border bg-background p-0.5">
          {[
            { v: "table", label: "Transactions", icon: List },
            { v: "analytics", label: "Analytics", icon: PieChart },
          ].map(({ v, label, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all md:px-4 md:py-2 md:text-sm",
                view === v
                  ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Summary strip */}
      {!txLoading && transactions.length > 0 && view === "table" && (
        <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3">
          <MiniStat
            label="Credits"
            value={summary.totalIncome}
            accent="text-green-600 dark:text-green-500"
          />
          <MiniStat
            label="Debits"
            value={summary.totalExpense}
            accent="text-red-600 dark:text-red-500"
          />
          <MiniStat
            label="Net"
            value={summary.netSavings}
            accent={
              summary.netSavings >= 0
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
            }
          />
        </div>
      )}

      {/* Content */}
      <div className="mt-4">
        {view === "table" ? (
          txLoading ? (
            <SkeletonTable rows={10} />
          ) : (
            <TransactionsTable
              transactions={transactions}
              sortBy={sort.sortBy}
              sortDir={sort.sortDir}
              onSortChange={setSort}
              onDelete={(id) => {
                const txn = transactions.find((t) => t.id === id);
                if (txn) setConfirmDelete(txn);
              }}
            />
          )
        ) : (
          <AnalyticsDashboard
            data={reports}
            loading={reportsLoading && !reports}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete this transaction?`}
        description={`${confirmDelete?.category?.name ?? ""} · ${confirmDelete?.description ?? ""}`}
        confirmLabel="Delete"
      />
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  const { formatCurrency } = require("@/modules/finance/lib/format");
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-sm font-semibold tabular-nums md:text-base", accent)}>
        {formatCurrency(value, { compact: true })}
      </div>
    </div>
  );
}