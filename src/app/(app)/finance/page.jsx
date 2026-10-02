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
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/modules/finance/lib/format";
import { MONTHS_SHORT } from "@/modules/finance/lib/dates";
import { SkeletonStatGrid, SkeletonTable } from "@/components/ui/skeleton";

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

  const trend = overview?.months?.map((m) => ({
    label: MONTHS_SHORT[m.month - 1],
    savings: m.net,
    }));

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

  // Shared Recharts tooltip styling — matches the popover theme
const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.2)",
};

  

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
      {trend && trend.some((t) => t.savings !== 0) && (
  <div className="rounded-2xl border border-border/70 bg-card p-4">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold">Yearly savings trend</h3>
      <span className="text-xs text-muted-foreground">{year}</span>
    </div>
    <div className="h-[140px] w-full">
      <ResponsiveContainer>
        <AreaChart data={trend}>
          <defs>
            <linearGradient id="dash-trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#dash-trend)"
          />
          <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
)}
      

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
         <>
         <SkeletonStatGrid />
        {/* or */}
        <SkeletonTable rows={5} />
         </>
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