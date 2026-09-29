// src/app/(app)/finance/page.jsx
"use client";

import { useState } from "react";
import { Search, Table2, PieChart } from "lucide-react";
import { useMonthlyOverview } from "@/modules/finance/hooks/useMonthlyOverview";
import { useMonthlyTransactions } from "@/modules/finance/hooks/useMonthlyTransactions";
import MonthTabs from "@/modules/finance/components/MonthTabs";
import StatsStrip from "@/modules/finance/components/StatsStrip";
import ActionBar from "@/modules/finance/components/ActionBar";
import TransactionsTable from "@/modules/finance/components/TransactionsTable";
import AnalyticsView from "@/modules/finance/components/AnalyticsView";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function FinanceDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [view, setView] = useState("table"); // "table" | "analytics"
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: overview } = useMonthlyOverview(year);
  const { transactions, loading, remove } = useMonthlyTransactions({
    year,
    month,
    type: typeFilter || undefined,
    search: search || undefined,
  });

  // Compute the current month's summary from the loaded transactions
  const summary = transactions.reduce(
    (acc, t) => {
      const amt = Number(t.amount);
      if (t.type === "income") acc.totalIncome += amt;
      else acc.totalExpense += amt;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );
  summary.netSavings = summary.totalIncome - summary.totalExpense;
  summary.savingsRate =
    summary.totalIncome > 0
      ? (summary.netSavings / summary.totalIncome) * 100
      : 0;

  const monthLabel = `${MONTHS_LONG[month - 1]} ${year}`;

  return (
    <div className="min-h-screen w-full bg-background">
      {/* ── Sticky top: stats + actions ── */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-[1600px] space-y-3 px-4 py-4 md:px-6 md:py-5">
          {/* Title row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
                Finance
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                {monthLabel} · {transactions.length} transaction
                {transactions.length === 1 ? "" : "s"}
              </p>
            </div>
            <ActionBar />
          </div>

          {/* Stats strip */}
          <StatsStrip
            summary={summary}
            monthLabel={monthLabel}
            totalCount={transactions.length}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-4 md:px-6 md:py-6">
        {/* Month + year */}
        <MonthTabs
          year={year}
          onYearChange={(y) => {
            setYear(y);
            const today = new Date();
            if (y === today.getFullYear()) setMonth(today.getMonth() + 1);
            else setMonth(1);
          }}
          selectedMonth={month}
          onMonthChange={setMonth}
          monthlyData={overview?.months}
        />

        {/* Toolbar: view toggle + search + type filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            {[
              { v: "table", label: "Transactions", icon: Table2 },
              { v: "analytics", label: "Analytics", icon: PieChart },
            ].map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {view === "table" && (
            <>
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions…"
                  className="h-9 pl-8 text-sm"
                />
              </div>

              <div className="flex rounded-lg border p-0.5">
                {[
                  { v: "", label: "All" },
                  { v: "income", label: "Income" },
                  { v: "expense", label: "Expense" },
                ].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setTypeFilter(f.v)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition",
                      typeFilter === f.v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content */}
        {view === "table" ? (
          loading ? (
            <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : (
            <TransactionsTable transactions={transactions} onDelete={remove} />
          )
        ) : (
          <AnalyticsView year={year} month={month} />
        )}
      </div>
    </div>
  );
}