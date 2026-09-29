// src/modules/finance/lib/format.js
import { CURRENCY_SYMBOL } from "../constants";

export function formatCurrency(n, { compact = false } = {}) {
  const num = Number(n ?? 0);
  if (compact && Math.abs(num) >= 100000) {
    return `${CURRENCY_SYMBOL}${(num / 100000).toFixed(2)}L`;
  }
  if (compact && Math.abs(num) >= 1000) {
    return `${CURRENCY_SYMBOL}${(num / 1000).toFixed(1)}k`;
  }
  return `${CURRENCY_SYMBOL}${num.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function formatSigned(n) {
  const num = Number(n ?? 0);
  const sign = num > 0 ? "+" : num < 0 ? "−" : "";
  return `${sign}${formatCurrency(Math.abs(num))}`;
}

/**
 * Central color rules for the whole finance module.
 * Every component imports from here so the semantics never drift.
 */
export const tone = {
  income: {
    text: "text-green-600 dark:text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    ring: "ring-green-500/20",
    solid: "bg-green-600",
  },
  expense: {
    text: "text-red-600 dark:text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    ring: "ring-red-500/20",
    solid: "bg-red-600",
  },
  neutral: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    ring: "ring-border",
    solid: "bg-muted-foreground",
  },
  warn: {
    text: "text-amber-600 dark:text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    ring: "ring-amber-500/20",
    solid: "bg-amber-500",
  },
};

export function typeTone(type) {
  return type === "income" ? tone.income : tone.expense;
}

/** Savings rate → semantic color bucket */
export function savingsTone(rate) {
  if (rate >= 20) return tone.income;
  if (rate >= 0) return tone.warn;
  return tone.expense;
}