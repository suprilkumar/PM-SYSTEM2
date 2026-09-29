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