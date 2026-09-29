// src/modules/finance/components/TransactionsTable.jsx
"use client";

import Link from "next/link";
import { Pencil, Trash2, Filter, ArrowUpRight, ArrowDownRight } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { formatCurrency, tone } from "../lib/format";
import { cn } from "@/core/utils/cn";

function groupByDate(txns) {
  const map = new Map();
  for (const t of txns) {
    const key = new Date(t.date).toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function dayLabel(iso) {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const isSame = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (isSame(d, today)) return "Today";
  if (isSame(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function sumByType(items) {
  return items.reduce(
    (acc, t) => {
      const amt = Number(t.amount);
      if (t.type === "income") acc.income += amt;
      else acc.expense += amt;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

export default function TransactionsTable({ transactions, onDelete }) {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Filter className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No transactions in this month</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add one to start tracking.
        </p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <>
      {/* ── Mobile: grouped cards ── */}
      <div className="space-y-5 md:hidden">
        {groups.map(([date, items]) => {
          const totals = sumByType(items);
          return (
            <section key={date}>
              {/* Day header with running total */}
              <div className="sticky top-0 z-10 -mx-1 mb-2 flex items-center justify-between bg-background/95 px-1 py-1.5 backdrop-blur">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold">
                    {dayLabel(date)}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {items.length} txn
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] tabular-nums">
                  {totals.income > 0 && (
                    <span className={tone.income.text}>
                      +{formatCurrency(totals.income, { compact: true }).replace("₹", "₹ ")}
                    </span>
                  )}
                  {totals.expense > 0 && (
                    <span className={tone.expense.text}>
                      −{formatCurrency(totals.expense, { compact: true }).replace("₹", "₹ ")}
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y overflow-hidden rounded-xl border bg-card">
                {items.map((t) => (
                  <MobileRow key={t.id} txn={t} onDelete={onDelete} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <table className="w-full">
          <thead className="border-b bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="w-[100px] px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((t) => (
              <DesktopRow key={t.id} txn={t} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────── */

function DesktopRow({ txn, onDelete }) {
  const isIncome = txn.type === "income";
  const t = tone[txn.type] ?? tone.neutral;

  return (
    <tr className="group transition hover:bg-accent/40">
      <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
        {new Date(txn.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-md", t.bg)}
            style={{ color: txn.category?.color ?? undefined }}
          >
            <CategoryIcon name={txn.category?.icon ?? "Circle"} size={13} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {txn.category?.name ?? "Unknown"}
            </div>
            {txn.parentCategory && (
              <div className="truncate text-[11px] text-muted-foreground">
                {txn.parentCategory.name}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="max-w-[280px] px-4 py-3">
        <span className="line-clamp-1 text-sm text-muted-foreground">
          {txn.description || "—"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs capitalize text-muted-foreground">
        {txn.paymentMethod ?? "—"}
      </td>
      <td className={cn("px-4 py-3 text-right text-sm font-semibold tabular-nums", t.text)}>
        {isIncome ? "+" : "−"}
        {formatCurrency(Number(txn.amount)).replace("₹", "₹ ")}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/finance/transactions/${txn.id}/edit`}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onDelete?.(txn.id)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileRow({ txn, onDelete }) {
  const isIncome = txn.type === "income";
  const t = tone[txn.type] ?? tone.neutral;

  return (
    <div className="flex items-stretch">
      {/* Tap target: whole card links to edit */}
      <Link
        href={`/finance/transactions/${txn.id}/edit`}
        className="flex min-w-0 flex-1 items-center gap-3 p-3 transition active:bg-accent/40"
      >
        {/* Category icon with tone-colored background */}
        <span
          className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", t.bg)}
          style={{ color: txn.category?.color ?? undefined }}
        >
          <CategoryIcon name={txn.category?.icon ?? "Circle"} size={18} />
        </span>

        {/* Middle: category + description */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {txn.category?.name ?? "Unknown"}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {txn.parentCategory && (
              <>
                <span className="truncate">{txn.parentCategory.name}</span>
                <span className="text-muted-foreground/50">·</span>
              </>
            )}
            <span className="truncate">
              {txn.description || txn.paymentMethod || "—"}
            </span>
          </div>
        </div>

        {/* Amount with direction arrow */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <div className={cn("flex items-center gap-1 text-sm font-semibold tabular-nums", t.text)}>
            {isIncome ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {formatCurrency(Number(txn.amount)).replace("₹", "₹ ")}
          </div>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {txn.paymentMethod ?? "—"}
          </span>
        </div>
      </Link>

      {/* Delete as a separate tap target — stops propagation naturally */}
      <button
        onClick={() => onDelete?.(txn.id)}
        className="grid w-11 shrink-0 place-items-center border-l text-muted-foreground transition active:bg-destructive/10 active:text-destructive"
        aria-label="Delete transaction"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}