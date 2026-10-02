// src/modules/finance/components/AnalyticsDashboard.jsx
"use client";

import { useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
  AreaChart, Area,
  ComposedChart,
} from "recharts";
import CategoryIcon from "./CategoryIcon";
import { formatCurrency, tone } from "../lib/format";
import { monthLabel } from "../lib/dates";
import { SkeletonChart, SkeletonStatGrid } from "@/components/ui/skeleton";
import { cn } from "@/core/utils/cn";

const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.2)",
};

export default function AnalyticsDashboard({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <SkeletonStatGrid />
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonChart height={280} />
          <SkeletonChart height={280} />
        </div>
        <SkeletonChart height={320} />
      </div>
    );
  }

  const { summary, byCategory, byDomain, trend, topCategories } = data;
  const hasData = summary.totalIncome > 0 || summary.totalExpense > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <p className="text-sm font-medium">No data in this range</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Adjust filters or add transactions to see analytics.
        </p>
      </div>
    );
  }

  // Single stacked bar for the whole period
  const budgetBar = [
    {
      name: "Income",
      income: summary.totalIncome,
      expense: summary.totalExpense,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <SummaryGrid summary={summary} />

      {/* Savings trend (line) */}
      {trend.length > 1 && (
        <Card title="Savings trend" subtitle="Net savings per period">
          <SavingsLine data={trend} />
        </Card>
      )}

      {/* Income vs expense (bar) */}
      {trend.length > 1 && (
        <Card title="Income vs expense" subtitle="Side-by-side comparison">
          <IncomeExpenseBar data={trend} />
        </Card>
      )}

      {/* Budget overview (single stacked bar) */}
      <Card title="Budget overview" subtitle="Total income vs expenses">
        <BudgetStackedBar data={budgetBar} summary={summary} />
      </Card>

      {/* Two-up: Pie + Top categories */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Spending by category">
          <CategoryDonut data={byCategory} />
        </Card>
        <Card title="Top categories">
          <TopCategoriesList items={topCategories} />
        </Card>
      </div>

      {/* Category bars */}
      {byCategory.length > 0 && (
        <Card
          title="Category breakdown"
          subtitle="Sorted by total spend"
        >
          <CategoryBars data={byCategory} />
        </Card>
      )}

      {/* Domain bars */}
      {byDomain.length > 0 && (
        <Card title="Domain breakdown" subtitle="Grouped by parent category">
          <div className="grid gap-1.5 md:grid-cols-2">
            {byDomain.map((d) => (
              <DomainBar key={d.id} domain={d} max={Math.max(...byDomain.map((x) => x.expense + x.income))} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SummaryGrid({ summary }) {
  const { totalIncome, totalExpense, netSavings, savingsRate } = summary;
  const rateTone =
    savingsRate >= 20 ? tone.income : savingsRate >= 0 ? tone.warn : tone.expense;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <SummaryCard
        label="Total income"
        value={formatCurrency(totalIncome)}
        tone={tone.income}
        accent="from-green-500 to-emerald-500"
      />
      <SummaryCard
        label="Total expense"
        value={formatCurrency(totalExpense)}
        tone={tone.expense}
        accent="from-red-500 to-rose-500"
      />
      <SummaryCard
        label="Net savings"
        value={formatCurrency(netSavings)}
        tone={netSavings >= 0 ? tone.income : tone.expense}
        accent={
          netSavings >= 0
            ? "from-primary to-magenta-500"
            : "from-red-500 to-rose-500"
        }
      />
      <SummaryCard
        label="Savings rate"
        value={`${savingsRate.toFixed(1)}%`}
        tone={rateTone}
        accent="from-amber-500 to-orange-500"
      />
    </div>
  );
}

function SummaryCard({ label, value, tone: t, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
      <div
        className={cn(
          "absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          accent
        )}
      />
      <div className="relative">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={cn("mt-1.5 text-xl font-semibold tabular-nums md:text-2xl", t.text)}>
          {value}
        </div>
      </div>
    </div>
  );
}

function SavingsLine({ data }) {
  const shaped = data.map((t) => ({ ...t, label: monthLabel(t.period) }));
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={shaped} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis
            dataKey="label"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fill="url(#savingsArea)"
            dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function IncomeExpenseBar({ data }) {
  const shaped = data.map((t) => ({ ...t, label: monthLabel(t.period) }));
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={shaped} barCategoryGap={16}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis
            dataKey="label"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="income"
            name="Income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expense"
            name="Expense"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BudgetStackedBar({ data, summary }) {
  const { totalIncome, totalExpense } = summary;
  const remaining = Math.max(0, totalIncome - totalExpense);

  return (
    <div className="space-y-4">
      <div className="flex h-10 w-full overflow-hidden rounded-full border border-border/60 bg-muted/40">
        {totalIncome > 0 && (
          <>
            <div
              className="flex h-full items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 text-[10px] font-semibold text-white transition-all duration-500"
              style={{
                width: `${(totalExpense / totalIncome) * 100}%`,
              }}
            >
              {(totalExpense / totalIncome) * 100 > 12 && "Spent"}
            </div>
            <div
              className="flex h-full items-center justify-center bg-gradient-to-r from-primary to-magenta-500 text-[10px] font-semibold text-white transition-all duration-500"
              style={{ width: `${(remaining / totalIncome) * 100}%` }}
            >
              {(remaining / totalIncome) * 100 > 12 && "Saved"}
            </div>
          </>
        )}
        {totalIncome === 0 && (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-muted-foreground">
            No income recorded
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <LegendDot
          color="bg-emerald-500"
          label="Spent"
          value={formatCurrency(totalExpense)}
        />
        <LegendDot
          color="bg-primary"
          label="Saved"
          value={formatCurrency(remaining)}
        />
        <LegendDot
          color="bg-green-500"
          label="Income"
          value={formatCurrency(totalIncome)}
        />
      </div>
    </div>
  );
}

function LegendDot({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function CategoryDonut({ data }) {
  if (!data?.length) return <Empty text="No expenses in this range" />;
  const top = data.slice(0, 8);
  const rest = data.slice(8);
  const restTotal = rest.reduce((s, c) => s + c.total, 0);
  const shaped = restTotal > 0
    ? [...top, { name: "Other", total: restTotal, color: "#94a3b8" }]
    : top;

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={shaped}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={100}
            paddingAngle={2}
            stroke="none"
          >
            {shaped.map((c, i) => (
              <Cell key={i} fill={c.color ?? "#64748b"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TopCategoriesList({ items }) {
  if (!items?.length) return <Empty text="No expense categories" />;

  return (
    <div className="space-y-3">
      {items.map((c, i) => (
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
              className="h-full rounded-full bg-gradient-to-r from-primary to-magenta-500 transition-all duration-500"
              style={{ width: `${c.share}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBars({ data }) {
  const shaped = data.slice(0, 10).map((c) => ({
    name: c.name,
    total: c.total,
    color: c.color,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={shaped}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis
            type="number"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            fontSize={11}
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
          />
          <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {shaped.map((c, i) => (
              <Cell key={i} fill={c.color ?? "#64748b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DomainBar({ domain, max }) {
  const total = domain.expense + domain.income;
  const pct = max > 0 ? (total / max) * 100 : 0;
  const Icon = () => <CategoryIcon name={domain.icon ?? "Circle"} size={14} />;

  return (
    <div className="rounded-xl border border-border/60 p-3">
      <div className="flex items-center gap-3">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: (domain.color ?? "#64748b") + "20",
            color: domain.color ?? "#64748b",
          }}
        >
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{domain.name}</div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: domain.color ?? "#64748b" }}
            />
          </div>
        </div>
        <div className="shrink-0 text-right text-xs">
          {domain.expense > 0 && (
            <div className={tone.expense.text}>
              −{formatCurrency(domain.expense, { compact: true })}
            </div>
          )}
          {domain.income > 0 && (
            <div className={tone.income.text}>
              +{formatCurrency(domain.income, { compact: true })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="grid h-[200px] place-items-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}