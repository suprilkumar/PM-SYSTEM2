// src/modules/finance/components/MonthTabs.jsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { formatCurrency } from "../lib/format";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

  return (
    <div className="space-y-2">
      {/* Year selector */}
      <div className="flex items-center justify-between">
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

      {/* Month tabs — horizontal scroll on mobile */}
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-12">
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
                "relative flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg border px-2 py-2 text-xs transition md:min-w-0",
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
  );
}