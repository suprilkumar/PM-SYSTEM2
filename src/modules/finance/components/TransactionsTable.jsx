// src/modules/finance/components/TransactionsTable.jsx
"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { formatCurrency, tone } from "../lib/format";
import { cn } from "@/core/utils/cn";

const SORTABLE_COLUMNS = {
  date: "Date",
  amount: "Amount",
  category: "Category",
  description: "Description",
  paymentMethod: "Mode",
};

export default function TransactionsTable({
  transactions,
  onDelete,
  sortBy = "date",
  sortDir = "desc",
  onSortChange,
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const sorted = useMemo(() => {
    if (!sortBy) return transactions;
    const dir = sortDir === "asc" ? 1 : -1;
    const list = [...transactions];
    list.sort((a, b) => {
      let av, bv;
      switch (sortBy) {
        case "date":
          av = new Date(a.date).getTime();
          bv = new Date(b.date).getTime();
          break;
        case "amount":
          av = Number(a.amount);
          bv = Number(b.amount);
          break;
        case "category":
          av = a.category?.name?.toLowerCase() ?? "";
          bv = b.category?.name?.toLowerCase() ?? "";
          break;
        case "description":
          av = (a.description ?? "").toLowerCase();
          bv = (b.description ?? "").toLowerCase();
          break;
        case "paymentMethod":
          av = (a.paymentMethod ?? "").toLowerCase();
          bv = (b.paymentMethod ?? "").toLowerCase();
          break;
        default:
          return 0;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [transactions, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (!onSortChange) return;
    if (sortBy === col) {
      onSortChange({ sortBy: col, sortDir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ sortBy: col, sortDir: col === "date" ? "desc" : "asc" });
    }
  };

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
        <Filter className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No transactions match</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your filters or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card md:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <SortableTh
                  col="date"
                  label="Date"
                  currentBy={sortBy}
                  dir={sortDir}
                  onSort={toggleSort}
                  className="w-[100px] pl-4"
                />
                <SortableTh
                  col="amount"
                  label="Amount"
                  currentBy={sortBy}
                  dir={sortDir}
                  onSort={toggleSort}
                  className="w-[140px] text-right"
                />
                <SortableTh
                  col="category"
                  label="Category"
                  currentBy={sortBy}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableTh
                  col="description"
                  label="Description"
                  currentBy={sortBy}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortableTh
                  col="paymentMethod"
                  label="Mode"
                  currentBy={sortBy}
                  dir={sortDir}
                  onSort={toggleSort}
                  className="w-[110px]"
                />
                <th className="w-[90px] px-4 py-2.5 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <DesktopRow
                  key={t.id}
                  txn={t}
                  onDelete={onDelete}
                  isLast={i === sorted.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile: grouped cards ── */}
      <div className="md:hidden">
        <MobileGroups transactions={sorted} onDelete={onDelete} />
      </div>
    </>
  );
}

function SortableTh({ col, label, currentBy, dir, onSort, className }) {
  const active = currentBy === col;
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th className={cn("px-3 py-2.5 text-left font-medium", className)}>
      <button
        onClick={() => onSort(col)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition",
          active ? "text-foreground" : "hover:bg-accent hover:text-foreground"
        )}
      >
        {label}
        <Icon className={cn("h-3 w-3", active ? "text-primary" : "opacity-40")} />
      </button>
    </th>
  );
}

function DesktopRow({ txn, onDelete, isLast }) {
  const isIncome = txn.type === "income";
  const t = tone[txn.type] ?? tone.neutral;

  return (
    <tr
      className={cn(
        "group transition-colors hover:bg-accent/40",
        !isLast && "border-b border-border/50"
      )}
    >
      <td className="whitespace-nowrap px-4 py-2.5 text-xs tabular-nums text-muted-foreground">
        {new Date(txn.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })}
      </td>

      <td
        className={cn(
          "whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums",
          t.text
        )}
      >
        <span className="inline-flex items-center gap-1">
          {isIncome ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {formatCurrency(Number(txn.amount)).replace("₹", "₹ ")}
        </span>
      </td>

      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg", t.bg)}
            style={{ color: txn.category?.color ?? undefined }}
          >
            <CategoryIcon name={txn.category?.icon ?? "Circle"} size={13} />
          </span>
          <div className="min-w-0">
            <div className="truncate font-medium">
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

      <td className="max-w-[280px] px-3 py-2.5">
        <span className="line-clamp-1 text-muted-foreground">
          {txn.description || "—"}
        </span>
      </td>

      <td className="px-3 py-2.5">
        <span className="inline-flex rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] font-medium capitalize text-muted-foreground">
          {txn.paymentMethod ?? "—"}
        </span>
      </td>

      <td className="px-4 py-2.5 text-right">
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

/* ── Mobile: grouped by day ── */

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
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function MobileGroups({ transactions, onDelete }) {
  const groups = groupByDate(transactions);

  return (
    <div className="space-y-5">
      {groups.map(([date, items]) => {
        const totals = items.reduce(
          (a, t) => {
            const amt = Number(t.amount);
            if (t.type === "income") a.income += amt;
            else a.expense += amt;
            return a;
          },
          { income: 0, expense: 0 }
        );

        return (
          <section key={date}>
            <div className="sticky top-14 z-10 -mx-1 mb-2 flex items-center justify-between bg-background/95 px-1 py-1.5 backdrop-blur">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold">{dayLabel(date)}</span>
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

            <div className="divide-y overflow-hidden rounded-2xl border border-border/70 bg-card">
              {items.map((t) => (
                <MobileRow key={t.id} txn={t} onDelete={onDelete} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MobileRow({ txn, onDelete }) {
  const isIncome = txn.type === "income";
  const t = tone[txn.type] ?? tone.neutral;

  return (
    <div className="flex items-stretch">
      <Link
        href={`/finance/transactions/${txn.id}/edit`}
        className="flex min-w-0 flex-1 items-center gap-3 p-3 transition active:bg-accent/40"
      >
        <span
          className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", t.bg)}
          style={{ color: txn.category?.color ?? undefined }}
        >
          <CategoryIcon name={txn.category?.icon ?? "Circle"} size={18} />
        </span>

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

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold tabular-nums",
              t.text
            )}
          >
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

      <button
        onClick={() => onDelete?.(txn.id)}
        className="grid w-11 shrink-0 place-items-center border-l border-border/60 text-muted-foreground transition active:bg-destructive/10 active:text-destructive"
        aria-label="Delete transaction"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}