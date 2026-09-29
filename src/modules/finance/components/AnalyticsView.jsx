// src/modules/finance/components/AnalyticsView.jsx
"use client";

import { useReports } from "../hooks/useReports";
import { CategoryPie, IncomeExpenseBar, SavingsTrend } from "./FinanceCharts";
import CategoryIcon from "./CategoryIcon";
import { formatCurrency } from "../lib/format";
import { cn } from "@/core/utils/cn";

export default function AnalyticsView({ year, month }) {
  // Reuse the reports endpoint but scoped to a single month
  const from = new Date(year, month - 1, 1).toISOString();
  const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
  const { data, loading, error } = useReports("month", { from, to });

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading analytics…</p>;
  }
  if (error || !data) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Couldn't load analytics ({error ?? "Unknown error"})
      </p>
    );
  }

  const { summary, byCategory, byDomain, trend, topCategories } = data;
  const hasData = summary.totalIncome > 0 || summary.totalExpense > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <p className="text-sm font-medium">No data for this month</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add transactions to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact summary */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <MiniStat label="Income" value={summary.totalIncome} tone="green" />
        <MiniStat label="Expense" value={summary.totalExpense} tone="red" />
        <MiniStat
          label="Savings"
          value={summary.netSavings}
          tone={summary.netSavings >= 0 ? "green" : "red"}
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 lg:col-span-1">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Spending by category
          </h3>
          <CategoryPie data={byCategory} />
        </div>

        <div className="rounded-xl border bg-card p-4 lg:col-span-2">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Top categories
          </h3>
          {topCategories.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No expenses this month
            </p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(c.total)}
                      <span className="ml-2 text-xs">({c.share.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${c.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trend (may be empty for a single month) */}
      {trend.length > 1 && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Income vs expense
          </h3>
          <IncomeExpenseBar data={trend} />
        </div>
      )}

      {/* Domain breakdown */}
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          By domain
        </h3>
        <div className="grid gap-1 sm:grid-cols-2">
          {byDomain.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-accent/40"
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{
                  backgroundColor: d.color + "20",
                  color: d.color,
                }}
              >
                <CategoryIcon name={d.icon} size={14} />
              </span>
              <span className="flex-1 text-sm font-medium">{d.name}</span>
              <div className="text-right text-xs">
                {d.expense > 0 && (
                  <div className="text-red-600">
                    −{formatCurrency(d.expense, { compact: true })}
                  </div>
                )}
                {d.income > 0 && (
                  <div className="text-green-600">
                    +{formatCurrency(d.income, { compact: true })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const colors = {
    green: "text-green-600",
    red: "text-red-600",
  };
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 text-sm font-semibold tabular-nums md:text-base", colors[tone])}>
        {formatCurrency(value, { compact: true })}
      </div>
    </div>
  );
}