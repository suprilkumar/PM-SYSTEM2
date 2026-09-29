// src/modules/finance/components/SummaryCards.jsx
"use client";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { formatCurrency } from "../lib/format";
import { cn } from "@/core/utils/cn";

export default function SummaryCards({ summary }) {
  const { totalIncome, totalExpense, netSavings, savingsRate } = summary;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Card
        icon={TrendingUp}
        label="Income"
        value={formatCurrency(totalIncome, { compact: true })}
        accent="text-green-600"
      />
      <Card
        icon={TrendingDown}
        label="Expense"
        value={formatCurrency(totalExpense, { compact: true })}
        accent="text-red-600"
      />
      <Card
        icon={PiggyBank}
        label="Savings"
        value={formatCurrency(netSavings, { compact: true })}
        sub={`${savingsRate.toFixed(1)}%`}
        accent={netSavings >= 0 ? "text-green-600" : "text-red-600"}
      />
    </div>
  );
}

function Card({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={cn("mt-1.5 text-base font-semibold tabular-nums sm:text-lg", accent)}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}