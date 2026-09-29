// src/modules/finance/components/TransactionsTable.jsx
"use client";

import Link from "next/link";
import { Pencil, Trash2, Filter } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { formatCurrency } from "../lib/format";
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
      {/* ── Mobile: stacked cards ── */}
      <div className="space-y-4 md:hidden">
        {groups.map(([date, items]) => (
          <div key={date}>
            <div className="mb-1.5 flex items-center justify-between px-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {dayLabel(date)}
              </span>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {items.length} txn
              </span>
            </div>
            <div className="divide-y overflow-hidden rounded-xl border bg-card">
              {items.map((t) => (
                <MobileRow key={t.id} txn={t} onDelete={onDelete} />
              ))}
            </div>
          </div>
        ))}
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

function DesktopRow({ txn, onDelete }) {
  const isIncome = txn.type === "income";
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
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md"
            style={{
              backgroundColor: (txn.category?.color ?? "#64748b") + "20",
              color: txn.category?.color ?? "#64748b",
            }}
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
      <td
        className={cn(
          "px-4 py-3 text-right text-sm font-semibold tabular-nums",
          isIncome ? "text-green-600" : "text-red-600"
        )}
      >
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
  return (
    <div className="flex items-center gap-3 p-3">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: (txn.category?.color ?? "#64748b") + "20",
          color: txn.category?.color ?? "#64748b",
        }}
      >
        <CategoryIcon name={txn.category?.icon ?? "Circle"} size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {txn.category?.name ?? "Unknown"}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {txn.parentCategory?.name && `${txn.parentCategory.name} · `}
          {txn.description || txn.paymentMethod}
        </div>
      </div>

      <div className="text-right">
        <div
          className={cn(
            "text-sm font-semibold tabular-nums",
            isIncome ? "text-green-600" : "text-red-600"
          )}
        >
          {isIncome ? "+" : "−"}
          {formatCurrency(Number(txn.amount)).replace("₹", "₹ ")}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          href={`/finance/transactions/${txn.id}/edit`}
          className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
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
    </div>
  );
}