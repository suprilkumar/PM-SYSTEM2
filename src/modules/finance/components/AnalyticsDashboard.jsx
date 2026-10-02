// src/modules/finance/components/AnalyticsDashboard.jsx
"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line,
  RadialBarChart, RadialBar,
} from "recharts";
import CategoryIcon from "./CategoryIcon";
import { formatCurrency, tone } from "../lib/format";
import { monthLabel } from "../lib/dates";
import {
  TOOLTIP_STYLE,
  AXIS_STYLE,
  colorFor,
  colorForName,
} from "../lib/chart-config";
import {
  SkeletonStatGrid,
  SkeletonChart,
} from "@/components/ui/skeleton";
import { cn } from "@/core/utils/cn";

export default function AnalyticsDashboard({ data, loading }) {
  if (loading || !data) return <AnalyticsSkeleton />;

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

  // Assign stable colors by name so the same category looks the same
  // across donut, bar, domain list, and top categories.
  const colorByName = {};
  [...byCategory, ...byDomain, ...topCategories].forEach((c, i) => {
    const key = c.name ?? c.categoryId ?? c.id;
    if (key && !colorByName[key]) colorByName[key] = colorForName(key);
  });

  return (
    <div className="space-y-4">
      {/* ── Summary ── */}
      <SummaryGrid summary={summary} />

      {/* ── Budget overview: single stacked bar ── */}
      <Card title="Budget overview" subtitle="How much of your income was spent">
        <BudgetStackedBar summary={summary} />
      </Card>

      {/* ── Savings + Income vs Expense side by side ── */}
      {trend.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Savings trend" subtitle="Net savings per period">
            <SavingsLine data={trend} />
          </Card>
          <Card title="Income vs expense" subtitle="Period-by-period comparison">
            <IncomeExpenseBar data={trend} />
          </Card>
        </div>
      )}

      {/* ── Cumulative savings ── */}
      {trend.length > 1 && (
        <Card
          title="Cumulative savings"
          subtitle="Running total of net savings across the period"
        >
          <CumulativeSavings data={trend} />
        </Card>
      )}

      {/* ── Donut + Top categories ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Spending by category" className="lg:col-span-3">
          <CategoryDonut data={byCategory} colorByName={colorByName} />
        </Card>
        <Card title="Top categories" className="lg:col-span-2">
          <TopCategoriesList items={topCategories} colorByName={colorByName} />
        </Card>
      </div>

      {/* ── Category bars ── */}
      {byCategory.length > 0 && (
        <Card
          title="Category breakdown"
          subtitle="Sorted by total spend — values shown inline"
        >
          <CategoryBars data={byCategory} colorByName={colorByName} />
        </Card>
      )}

      {/* ── Domain split (income vs expense per domain) ── */}
      {byDomain.length > 0 && (
        <Card
          title="Domains"
          subtitle="Income and expenses grouped by top-level category"
        >
          <DomainSplit data={byDomain} colorByName={colorByName} />
        </Card>
      )}

      {/* ── Weekday spending pattern ── */}
      {trend.length > 0 && data.weekday && (
        <Card
          title="Spending by day of week"
          subtitle="Where your money goes during the week"
        >
          <WeekdayBars data={data.weekday} />
        </Card>
      )}
    </div>
  );
}

/* ───────────────────────────────────────── */

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonStatGrid />
      <SkeletonChart height={120} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonChart height={280} />
        <SkeletonChart height={280} />
      </div>
      <SkeletonChart height={360} />
      <SkeletonChart height={320} />
    </div>
  );
}

function Card({ title, subtitle, children, className }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-4 md:p-5",
        className
      )}
    >
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

/* ── Summary ── */

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
        <div
          className={cn(
            "mt-1.5 text-xl font-semibold tabular-nums md:text-2xl",
            t.text
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* ── Budget stacked bar ── */

function BudgetStackedBar({ summary }) {
  const { totalIncome, totalExpense } = summary;
  const remaining = Math.max(0, totalIncome - totalExpense);
  const spentPct = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const savedPct = totalIncome > 0 ? (remaining / totalIncome) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex h-12 w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
          {totalIncome > 0 ? (
            <>
              <div
                className="flex h-full items-center justify-center bg-gradient-to-r from-red-500 to-rose-500 text-xs font-semibold text-white transition-all duration-500"
                style={{ width: `${spentPct}%` }}
              >
                {spentPct > 10 && `Spent ${spentPct.toFixed(0)}%`}
              </div>
              <div
                className="flex h-full items-center justify-center bg-gradient-to-r from-primary to-magenta-500 text-xs font-semibold text-white transition-all duration-500"
                style={{ width: `${savedPct}%` }}
              >
                {savedPct > 10 && `Saved ${savedPct.toFixed(0)}%`}
              </div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No income recorded
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <LegendChip
          color="#10b981"
          label="Income"
          value={formatCurrency(totalIncome)}
        />
        <LegendChip
          color="#e11d48"
          label="Spent"
          value={formatCurrency(totalExpense)}
        />
        <LegendChip
          color="#a855f7"
          label="Saved"
          value={formatCurrency(remaining)}
        />
      </div>
    </div>
  );
}

function LegendChip({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

/* ── Savings line ── */

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
          <XAxis dataKey="label" {...AXIS_STYLE} />
          <YAxis
            {...AXIS_STYLE}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
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

/* ── Income vs expense ── */

function IncomeExpenseBar({ data }) {
  const shaped = data.map((t) => ({ ...t, label: monthLabel(t.period) }));
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={shaped} barCategoryGap={16}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="label" {...AXIS_STYLE} />
          <YAxis
            {...AXIS_STYLE}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" name="Expense" fill="#e11d48" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Cumulative savings ── */

function CumulativeSavings({ data }) {
  let running = 0;
  const shaped = data.map((t) => {
    running += t.savings;
    return {
      label: monthLabel(t.period),
      cumulative: running,
    };
  });

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <LineChart data={shaped} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="label" {...AXIS_STYLE} />
          <YAxis
            {...AXIS_STYLE}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Category donut with inline value labels ── */

function CategoryDonut({ data, colorByName }) {
  if (!data?.length) return <Empty text="No data in this range" />;

  const shaped = data.map((c) => ({
    ...c,
    fill: c.color ?? colorByName[c.name] ?? colorFor(0),
  }));

  const total = shaped.reduce((s, c) => s + c.total, 0);

  return (
    <div className="relative">
      <div className="h-[340px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={shaped}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={115}
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              labelLine={false}
              label={({ percent, index }) => {
                if (percent < 0.04) return null;
                return `${(percent * 100).toFixed(0)}%`;
              }}
            >
              {shaped.map((c, i) => (
                <Cell key={i} fill={c.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, _n, p) => [
                `${formatCurrency(v)} · ${((v / total) * 100).toFixed(1)}%`,
                p?.payload?.name,
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="circle"
              formatter={(value, entry) => (
                <span className="text-muted-foreground">
                  {value}{" "}
                  <span className="text-foreground/70">
                    {formatCurrency(entry.payload.total, { compact: true })}
                  </span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Top categories list ── */

function TopCategoriesList({ items, colorByName }) {
  if (!items?.length) return <Empty text="No expense categories" />;
  const max = Math.max(...items.map((i) => i.total), 1);

  return (
    <div className="space-y-4">
      {items.map((c, i) => {
        const color = colorByName[c.name] ?? colorFor(i);
        const widthPct = (c.total / max) * 100;
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {c.name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatCurrency(c.total)}
                <span className="ml-2 text-xs">({c.share.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Category horizontal bars ── */

function CategoryBars({ data, colorByName }) {
  // Cap to 12 so labels stay readable; sort desc so the biggest is on top
  const shaped = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 12)
    .map((c) => ({
      name: c.name,
      total: c.total,
      fill: c.color ?? colorByName[c.name] ?? colorFor(0),
    }));

  const maxTotal = Math.max(...shaped.map((s) => s.total), 1);

  return (
    <div className="space-y-3">
      {shaped.map((c) => {
        const pct = (c.total / maxTotal) * 100;
        return (
          <div
            key={c.name}
            className="grid grid-cols-[minmax(80px,140px)_1fr_auto] items-center gap-3"
          >
            <span className="truncate text-sm font-medium" title={c.name}>
              {c.name}
            </span>
            <div className="h-6 overflow-hidden rounded-md bg-muted/50">
              <div
                className="flex h-full items-center justify-end rounded-md pr-2 transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: c.fill,
                }}
              >
                {pct > 20 && (
                  <span className="text-[10px] font-semibold text-white">
                    {formatCurrency(c.total, { compact: true })}
                  </span>
                )}
              </div>
            </div>
            <span className="w-[80px] text-right text-sm font-semibold tabular-nums">
              {formatCurrency(c.total, { compact: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Domain split (income vs expense per domain) ── */

function DomainSplit({ data, colorByName }) {
  const max = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1
  );

  return (
    <div className="space-y-4">
      {data.map((d) => {
        const color = d.color ?? colorByName[d.name] ?? colorFor(0);
        const incomePct = (d.income / max) * 100;
        const expensePct = (d.expense / max) * 100;

        return (
          <div
            key={d.id}
            className="rounded-xl border border-border/60 bg-muted/20 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: color + "20", color }}
              >
                <CategoryIcon name={d.icon ?? "Circle"} size={14} />
              </span>
              <span className="flex-1 truncate text-sm font-semibold">
                {d.name}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {d.income > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className={tone.income.text}>Income</span>
                    <span className="tabular-nums font-medium">
                      +{formatCurrency(d.income)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${incomePct}%` }}
                    />
                  </div>
                </div>
              )}

              {d.expense > 0 && (
                <div>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className={tone.expense.text}>Expense</span>
                    <span className="tabular-nums font-medium">
                      −{formatCurrency(d.expense)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-500"
                      style={{ width: `${expensePct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Weekday pattern ── */

function WeekdayBars({ data }) {
  const shaped = data.map((d) => ({
    ...d,
    label: d.weekday.slice(0, 3),
  }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer>
        <BarChart data={shaped}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="label" {...AXIS_STYLE} />
          <YAxis
            {...AXIS_STYLE}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="expense" fill="#e11d48" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Empty ── */

function Empty({ text }) {
  return (
    <div className="grid h-[200px] place-items-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}