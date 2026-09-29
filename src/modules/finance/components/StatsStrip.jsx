// src/modules/finance/components/StatsStrip.jsx
"use client";

import { ArrowUpRight, ArrowDownRight, PiggyBank, Percent } from "lucide-react";
import { formatCurrency } from "../lib/format";
import { cn } from "@/core/utils/cn";

export default function StatsStrip({ summary, monthLabel, totalCount }) {
  const { totalIncome, totalExpense, netSavings, savingsRate } = summary;

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      <Stat
        icon={ArrowUpRight}
        label="Income"
        value={formatCurrency(totalIncome)}
        sub={`${totalCount} txns`}
        accent="text-green-600"
        bgAccent="bg-green-500/10"
      />
      <Stat
        icon={ArrowDownRight}
        label="Expense"
        value={formatCurrency(totalExpense)}
        sub={monthLabel}
        accent="text-red-600"
        bgAccent="bg-red-500/10"
      />
      <Stat
        icon={PiggyBank}
        label="Net savings"
        value={formatCurrency(netSavings)}
        sub={netSavings >= 0 ? "Positive" : "Negative"}
        accent={netSavings >= 0 ? "text-green-600" : "text-red-600"}
        bgAccent={netSavings >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
      />
      <Stat
        icon={Percent}
        label="Savings rate"
        value={`${savingsRate.toFixed(1)}%`}
        sub={savingsRate >= 20 ? "Healthy" : savingsRate >= 0 ? "Low" : "Overspending"}
        accent={savingsRate >= 20 ? "text-green-600" : savingsRate >= 0 ? "text-amber-600" : "text-red-600"}
        bgAccent="bg-primary/10"
      />
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, accent, bgAccent }) {
  return (
    <div className="rounded-xl border bg-card p-3 md:p-4">
      <div className="flex items-center gap-2">
        <span className={cn("grid h-7 w-7 place-items-center rounded-md", bgAccent)}>
          <Icon className={cn("h-3.5 w-3.5", accent)} />
        </span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className={cn("mt-2 text-lg font-semibold tabular-nums md:text-xl", accent)}>
        {value}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}