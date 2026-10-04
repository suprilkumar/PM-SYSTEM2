// src/modules/finance/components/DatePicker.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/core/utils/cn";
import { MONTHS_LONG, MONTHS_SHORT } from "../lib/dates";

function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromISODate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0 = Sunday
  const total = daysInMonth(year, month);
  const cells = [];
  // Leading blanks
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
  // Trailing blanks to fill the last row (7 columns)
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DatePicker({ value, onChange, className }) {
  const selected = value ? fromISODate(value) : new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  // Reset view to selected date whenever the popover opens
  useEffect(() => {
    if (open) {
      const d = value ? fromISODate(value) : new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setYearMenuOpen(false);
    }
  }, [open, value]);

  // Outside click closes
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const today = new Date();

  const shiftMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const pick = (d) => {
    onChange(toISODate(d));
    setOpen(false);
  };

  const quickOptions = [
    { label: "Today", getDate: () => new Date() },
    { label: "Yesterday", getDate: () => new Date(Date.now() - 864e5) },
    { label: "2 days ago", getDate: () => new Date(Date.now() - 2 * 864e5) },
    { label: "1 week ago", getDate: () => new Date(Date.now() - 7 * 864e5) },
  ];

  const selectedDate = value ? fromISODate(value) : null;
  const display = selectedDate
    ? selectedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pick a date";

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm transition",
          open ? "ring-2 ring-primary/30" : "hover:bg-accent/40"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">{display}</span>
        {selectedDate && sameDay(selectedDate, today) && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Today
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-border/70 bg-popover shadow-2xl md:right-auto md:w-[320px]">
          {/* Quick options */}
          <div className="flex gap-1 overflow-x-auto border-b border-border/60 bg-muted/30 p-2">
            {quickOptions.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => pick(q.getDate())}
                className="shrink-0 rounded-md border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Month + year header */}
          <div className="flex items-center justify-between border-b border-border/60 p-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {/* Month display */}
              <div className="text-sm font-semibold tabular-nums">
                {MONTHS_LONG[viewMonth]}
              </div>

              {/* Year selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setYearMenuOpen((o) => !o)}
                  className="flex items-center gap-0.5 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums transition hover:bg-accent"
                >
                  {viewYear}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition",
                      yearMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {yearMenuOpen && (
                  <div className="absolute left-1/2 top-full z-50 mt-1 max-h-[220px] w-[100px] -translate-x-1/2 overflow-y-auto rounded-lg border border-border/70 bg-popover p-1 shadow-lg">
                    {Array.from({ length: 12 }, (_, i) => viewYear - 6 + i).map(
                      (y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => {
                            setViewYear(y);
                            setYearMenuOpen(false);
                          }}
                          className={cn(
                            "block w-full rounded-md px-2 py-1.5 text-left text-xs tabular-nums transition",
                            y === viewYear
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          )}
                        >
                          {y}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-0.5 px-2 pt-2 text-center text-[10px] font-medium uppercase text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5 p-2">
            {grid.map((d, i) => {
              if (!d) return <div key={i} />;
              const isToday = sameDay(d, today);
              const isSelected = selectedDate && sameDay(d, selectedDate);
              const isCurrentMonth = d.getMonth() === viewMonth;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(d)}
                  className={cn(
                    "grid h-9 place-items-center rounded-md text-xs tabular-nums transition",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : isToday
                      ? "bg-primary/10 font-semibold text-primary"
                      : isCurrentMonth
                      ? "text-foreground hover:bg-accent"
                      : "text-muted-foreground/50 hover:bg-accent"
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/60 p-2">
            <button
              type="button"
              onClick={() => pick(new Date())}
              className="text-xs font-medium text-primary hover:underline"
            >
              Jump to today
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}