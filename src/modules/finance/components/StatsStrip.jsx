// src/modules/finance/components/StatsStrip.jsx
"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Percent,
  ChevronDown,
} from "lucide-react";
import { formatCurrency, tone, savingsTone } from "../lib/format";
import { cn } from "@/core/utils/cn";

export default function StatsStrip({ summary, monthLabel, totalCount }) {
  const { totalIncome, totalExpense, netSavings, savingsRate } = summary;

  const stats = [
    {
      key: "income",
      icon: ArrowUpRight,
      label: "Income",
      value: formatCurrency(totalIncome),
      sub: `${totalCount} transaction${totalCount === 1 ? "" : "s"}`,
      tone: tone.income,
    },
    {
      key: "expense",
      icon: ArrowDownRight,
      label: "Expense",
      value: formatCurrency(totalExpense),
      sub: monthLabel,
      tone: tone.expense,
    },
    {
      key: "savings",
      icon: PiggyBank,
      label: "Net savings",
      value: formatCurrency(netSavings),
      sub: netSavings >= 0 ? "Positive month" : "Negative month",
      tone: netSavings >= 0 ? tone.income : tone.expense,
    },
    {
      key: "rate",
      icon: Percent,
      label: "Savings rate",
      value: `${savingsRate.toFixed(1)}%`,
      sub:
        savingsRate >= 20
          ? "Healthy"
          : savingsRate >= 0
          ? "Low"
          : "Overspending",
      tone: savingsTone(savingsRate),
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Mobile: collapsible summary ── */}
      <div className="rounded-xl border bg-card md:hidden">
        {/* Always-visible: net savings is the hero number */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-3 p-3 text-left"
          aria-expanded={open}
        >
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
              netSavings >= 0 ? tone.income.bg : tone.expense.bg
            )}
          >
            <PiggyBank
              className={cn(
                "h-4 w-4",
                netSavings >= 0 ? tone.income.text : tone.expense.text
              )}
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Net savings · {monthLabel}
            </div>
            <div
              className={cn(
                "text-lg font-semibold tabular-nums",
                netSavings >= 0 ? tone.income.text : tone.expense.text
              )}
            >
              {formatCurrency(netSavings)}
            </div>
          </div>

          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              savingsRate >= 20
                ? `${tone.income.bg} ${tone.income.text}`
                : savingsRate >= 0
                ? `${tone.warn.bg} ${tone.warn.text}`
                : `${tone.expense.bg} ${tone.expense.text}`
            )}
          >
            {savingsRate.toFixed(1)}%
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Expand: full breakdown */}
        <div
          className={cn(
            "grid overflow-hidden border-t transition-all duration-200",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0 divide-y">
            {stats.map((s) => (
              <Row key={s.key} stat={s} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Desktop: 4-up cards ── */}
      <div className="hidden grid-cols-2 gap-3 md:grid md:grid-cols-4">
        {stats.map((s) => (
          <DesktopStat key={s.key} stat={s} />
        ))}
      </div>
    </>
  );
}

function Row({ stat }) {
  const { icon: Icon, label, value, sub, tone: t } = stat;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-md", t.bg)}>
        <Icon className={cn("h-3.5 w-3.5", t.text)} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-[11px] text-muted-foreground/70">{sub}</div>
      </div>
      <div className={cn("text-sm font-semibold tabular-nums", t.text)}>
        {value}
      </div>
    </div>
  );
}

function DesktopStat({ stat }) {
  const { icon: Icon, label, value, sub, tone: t } = stat;
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className={cn("grid h-7 w-7 place-items-center rounded-md", t.bg)}>
          <Icon className={cn("h-3.5 w-3.5", t.text)} />
        </span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className={cn("mt-2 text-xl font-semibold tabular-nums", t.text)}>
        {value}
      </div>
      <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}