// src/modules/finance/components/FilterBar.jsx
"use client";

import { Calendar, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";
import { MONTHS_LONG, RANGE_PRESETS } from "../lib/dates";

export default function FilterBar({ filters, onChange, showSearch = true }) {
  const {
    preset = "this-month",
    month,
    year,
    from,
    to,
    type = "",
    search = "",
  } = filters;

  const set = (patch) => onChange({ ...filters, ...patch });

  const shiftMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    set({ month: m, year: y, preset: "this-month" });
  };

  const isMonthPreset = preset === "this-month" || preset === "last-month";
  const isCustom = preset === "custom";

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-3 md:p-4">
      {/* Row 1: preset chips */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 md:flex-wrap md:overflow-visible">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => set({ preset: p.value })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              preset === p.value
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Row 2: contextual controls */}
      <div className="flex flex-wrap items-center gap-2">
        {isMonthPreset && (
          <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5">
            <button
              onClick={() => shiftMonth(-1)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[110px] px-1 text-center text-xs font-medium tabular-nums">
              {MONTHS_LONG[month - 1]} {year}
            </span>
            <button
              onClick={() => shiftMonth(1)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isCustom && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={from ? new Date(from).toISOString().slice(0, 10) : ""}
                onChange={(e) => set({ from: e.target.value })}
                className="h-9 w-[150px] pl-7 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground">to</span>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={to ? new Date(to).toISOString().slice(0, 10) : ""}
                onChange={(e) => set({ to: e.target.value })}
                className="h-9 w-[150px] pl-7 text-xs"
              />
            </div>
          </div>
        )}

        {/* Credit / Debit toggle */}
        <div className="flex rounded-lg border bg-background p-0.5">
          {[
            { v: "", label: "All" },
            { v: "income", label: "Credits" },
            { v: "expense", label: "Debits" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => set({ type: t.v })}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                type === t.v
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {showSearch && (
          <div className="relative ml-auto w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => set({ search: e.target.value })}
              placeholder="Search notes, categories…"
              className="h-9 pl-8 pr-8 text-xs"
            />
            {search && (
              <button
                onClick={() => set({ search: "" })}
                className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}