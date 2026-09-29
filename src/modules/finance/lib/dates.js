// src/modules/finance/lib/dates.js

export function getRange(range) {
  const now = new Date();
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d) =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

  switch (range) {
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), q * 3, 1);
      const to = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
      return { from, to };
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case "last6": {
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { from, to: endOfMonth(now) };
    }
    case "all":
    default:
      return { from: new Date(2000, 0, 1), to: endOfMonth(now) };
  }
}

export function monthLabel(period) {
  // "2026-01" → "Jan '26"
  const [y, m] = period.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return `${d.toLocaleString("en-US", { month: "short" })} '${y.slice(2)}`;
}