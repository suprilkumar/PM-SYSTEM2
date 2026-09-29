// src/modules/finance/components/FinanceCharts.jsx
"use client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts";
import { monthLabel } from "../lib/dates";
import { formatCurrency } from "../lib/format";

export function CategoryPie({ data }) {
  if (!data?.length) return <Empty text="No expenses yet" />;
  const total = data.reduce((s, c) => s + c.total, 0);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((c, i) => (
              <Cell key={i} fill={c.color ?? "#64748b"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="sr-only">Total spend {formatCurrency(total)}</div>
    </div>
  );
}

export function IncomeExpenseBar({ data }) {
  if (!data?.length) return <Empty text="No data for this period" />;
  const shaped = data.map((t) => ({ ...t, label: monthLabel(t.period) }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={shaped} barCategoryGap={14}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SavingsTrend({ data }) {
  if (!data?.length) return <Empty text="No trend yet" />;
  const shaped = data.map((t) => ({ ...t, label: monthLabel(t.period) }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer>
        <AreaChart data={shaped}>
          <defs>
            <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            formatter={(v) => formatCurrency(v)}
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#savingsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="grid h-[220px] place-items-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}