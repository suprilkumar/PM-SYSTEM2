// src/modules/finance/components/MonthTabs.jsx
"use client";

import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { formatCurrency, tone } from "../lib/format";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthTabs({
  year,
  onYearChange,
  selectedMonth,
  onMonthChange,
  monthlyData,
}) {
  const now = new Date();
  const isCurrentYear = year === now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const goPrev = () => {
    if (selectedMonth === 1) {
      onYearChange(year - 1);
      onMonthChange(12);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };
  const goNext = () => {
    if (selectedMonth === 12) {
      onYearChange(year + 1);
      onMonthChange(1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  const activeData = monthlyData?.[selectedMonth - 1];

  return (
    <div className="space-y-2">
      {/* ── Mobile: single-row nav with dropdown ── */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={goPrev}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground transition active:scale-95 hover:bg-accent"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="relative flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="h-10 w-full appearance-none rounded-lg border bg-background pl-3 pr-9 text-sm font-medium"
            aria-label="Select month"
          >
            {MONTHS_LONG.map((label, i) => {
              const data = monthlyData?.[i];
              const isCurrent = isCurrentYear && i + 1 === currentMonth;
              const hasData = data && data.count > 0;
              const suffix = isCurrent
                ? " · current"
                : hasData
                ? ` · ${data.count} txn`
                : "";
              return (
                <option key={label} value={i + 1}>
                  {label}
                  {suffix}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        <button
          onClick={goNext}
          disabled={year >= now.getFullYear() + 1 && selectedMonth === 12}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground transition active:scale-95 hover:bg-accent disabled:opacity-40"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile year + summary line */}
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onYearChange(year - 1)}
            className="grid h-8 w-8 place-items-center rounded-md border bg-background text-muted-foreground transition hover:bg-accent"
            aria-label="Previous year"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[52px] text-center text-xs font-semibold tabular-nums">
            {year}
          </span>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={year >= now.getFullYear() + 1}
            className="grid h-8 w-8 place-items-center rounded-md border bg-background text-muted-foreground transition hover:bg-accent disabled:opacity-40"
            aria-label="Next year"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {activeData && activeData.count > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className={cn("font-semibold tabular-nums", tone.income.text)}>
              +{formatCurrency(activeData.income, { compact: true }).replace("₹", "₹ ")}
            </span>
            <span className={cn("font-semibold tabular-nums", tone.expense.text)}>
              −{formatCurrency(activeData.expense, { compact: true }).replace("₹", "₹ ")}
            </span>
          </div>
        )}
      </div>

      {/* ── Desktop: year nav + tab grid ── */}
      <div className="hidden md:block">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onYearChange(year - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-[64px] text-center text-sm font-semibold tabular-nums">
              {year}
            </div>
            <button
              onClick={() => onYearChange(year + 1)}
              disabled={year >= now.getFullYear() + 1}
              className="grid h-8 w-8 place-items-center rounded-lg border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {MONTHS_SHORT[selectedMonth - 1]}
            </span>{" "}
            {year}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-1">
          {MONTHS_SHORT.map((label, i) => {
            const monthNum = i + 1;
            const data = monthlyData?.[i];
            const active = monthNum === selectedMonth;
            const isCurrent = isCurrentYear && monthNum === currentMonth;
            const hasData = data && data.count > 0;

            return (
              <button
                key={label}
                onClick={() => onMonthChange(monthNum)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-xs transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : hasData
                    ? "border-border bg-background hover:bg-accent"
                    : "border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-accent/50"
                )}
              >
                <span className="font-medium">{label}</span>
                {hasData ? (
                  <span
                    className={cn(
                      "tabular-nums text-[10px] leading-tight",
                      active
                        ? "text-primary-foreground/80"
                        : data.net >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {data.net >= 0 ? "+" : "−"}
                    {formatCurrency(Math.abs(data.net), { compact: true }).replace("₹", "")}
                  </span>
                ) : (
                  <span className="text-[10px] leading-tight opacity-40">—</span>
                )}
                {isCurrent && !active && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}