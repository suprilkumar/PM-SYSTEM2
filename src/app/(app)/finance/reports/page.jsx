// src/app/(app)/finance/reports/page.jsx
"use client";
import { useState } from "react";
import { useReports } from "@/modules/finance/hooks/useReports";
import { REPORT_RANGES } from "@/modules/finance/constants";
import { CategoryPie, IncomeExpenseBar, SavingsTrend } from "@/modules/finance/components/FinanceCharts";
import CategoryIcon from "@/modules/finance/components/CategoryIcon";
import { formatCurrency } from "@/modules/finance/lib/format";
import { cn } from "@/core/utils/cn";

export default function ReportsPage() {
  const [range, setRange] = useState("month");
  const { data, loading } = useReports(range);

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <h1 className="text-xl font-bold">Reports</h1>

      {/* Range switch */}
      <div className="flex flex-wrap gap-1 rounded-lg border p-1">
        {REPORT_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs transition",
              range === r.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Income" value={formatCurrency(data.summary.totalIncome, { compact: true })} color="text-green-600" />
            <Stat label="Expense" value={formatCurrency(data.summary.totalExpense, { compact: true })} color="text-red-600" />
            <Stat label="Savings" value={formatCurrency(data.summary.netSavings, { compact: true })} color={data.summary.netSavings >= 0 ? "text-green-600" : "text-red-600"} />
            <Stat label="Rate" value={`${data.summary.savingsRate.toFixed(1)}%`} color="text-primary" />
          </div>

          {/* Category pie */}
          <Section title="Spending by category">
            <CategoryPie data={data.byCategory} />
          </Section>

          {/* Trend */}
          {data.trend.length > 1 && (
            <>
              <Section title="Income vs expense">
                <IncomeExpenseBar data={data.trend} />
              </Section>
              <Section title="Savings trend">
                <SavingsTrend data={data.trend} />
              </Section>
            </>
          )}

          {/* Top categories */}
          <Section title="Top categories">
            {data.topCategories.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No expenses in this period
              </p>
            ) : (
              <div className="space-y-3">
                {data.topCategories.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatCurrency(c.total)} · {c.share.toFixed(1)}%
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
          </Section>

          {/* Domain breakdown */}
          <Section title="By domain">
            <div className="space-y-1">
              {data.byDomain.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/40">
                  <div
                    className="grid h-8 w-8 place-items-center rounded-lg"
                    style={{
                      backgroundColor: d.color + "20",
                      color: d.color,
                    }}
                  >
                    <CategoryIcon name={d.icon} size={14} />
                  </div>
                  <span className="flex-1 text-sm font-medium">{d.name}</span>
                  <div className="text-right text-xs">
                    {d.expense > 0 && (
                      <div className="text-red-600">−{formatCurrency(d.expense, { compact: true })}</div>
                    )}
                    {d.income > 0 && (
                      <div className="text-green-600">+{formatCurrency(d.income, { compact: true })}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-base font-semibold tabular-nums", color)}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}