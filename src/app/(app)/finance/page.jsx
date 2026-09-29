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
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: overview } = useMonthlyOverview(year);
  const { transactions, loading, remove } = useMonthlyTransactions({
    year,
    month,
    type: typeFilter || undefined,
    search: search || undefined,
  });

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
      {/* ── Sticky top ── */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-[1600px] space-y-3 px-4 py-3 md:px-6 md:py-5">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight md:text-2xl">
                Finance
              </h1>
              <p className="text-[11px] text-muted-foreground md:text-sm">
                {monthLabel}
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

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex shrink-0 rounded-lg border p-0.5">
            {[
              { v: "table", icon: Table2, label: "List" },
              { v: "analytics", icon: PieChart, label: "Analytics" },
            ].map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition md:px-3",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {view === "table" && (
            <>
              {/* Mobile: search toggle */}
              <button
                onClick={() => setShowSearch((s) => !s)}
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border bg-background transition md:hidden",
                  showSearch ? "border-primary text-primary" : "text-muted-foreground"
                )}
                aria-label="Toggle search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Desktop search */}
              <div className="relative hidden flex-1 md:block md:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions…"
                  className="h-9 pl-8 text-sm"
                />
              </div>

              {/* Type filter */}
              <div className="ml-auto flex shrink-0 rounded-lg border p-0.5">
                {[
                  { v: "", label: "All" },
                  { v: "income", label: "In" },
                  { v: "expense", label: "Out" },
                ].map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setTypeFilter(f.v)}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-xs font-medium transition md:px-3",
                      typeFilter === f.v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <span className="md:hidden">{f.label}</span>
                    <span className="hidden md:inline">
                      {f.v === "" ? "All" : f.v === "income" ? "Income" : "Expense"}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mobile-only search input (revealed) */}
        {view === "table" && showSearch && (
          <div className="relative md:hidden">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions…"
              className="h-10 pl-8 text-sm"
              autoFocus
            />
          </div>
        )}

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