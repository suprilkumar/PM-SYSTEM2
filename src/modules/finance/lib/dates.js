// src/modules/finance/lib/dates.js

export const RANGE_PRESETS = [
  { value: "this-month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "this-year", label: "This year" },
  { value: "last-10", label: "Last 10 days" },
  { value: "last-20", label: "Last 20 days" },
  { value: "last-30", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
];

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Resolve a preset + optional month/year into { from, to }. */
export function resolveRange({ preset, month, year, from: customFrom, to: customTo }) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  switch (preset) {
    case "this-month":
      return {
        from: new Date(y, m - 1, 1),
        to: endOfDay(new Date(y, m, 0)),
      };
    case "last-month": {
      const d = new Date(y, m - 2, 1);
      return { from: d, to: endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
    }
    case "this-quarter": {
      const q = Math.floor((m - 1) / 3);
      return {
        from: new Date(y, q * 3, 1),
        to: endOfDay(new Date(y, q * 3 + 3, 0)),
      };
    }
    case "this-year":
      return {
        from: new Date(y, 0, 1),
        to: endOfDay(new Date(y, 11, 31)),
      };
    case "last-10":
      return { from: startOfDay(new Date(Date.now() - 9 * 864e5)), to: endOfDay(now) };
    case "last-20":
      return { from: startOfDay(new Date(Date.now() - 19 * 864e5)), to: endOfDay(now) };
    case "last-30":
      return { from: startOfDay(new Date(Date.now() - 29 * 864e5)), to: endOfDay(now) };
    case "custom":
      return {
        from: customFrom ? startOfDay(customFrom) : startOfDay(now),
        to: customTo ? endOfDay(customTo) : endOfDay(now),
      };
    default:
      return { from: new Date(y, m - 1, 1), to: endOfDay(new Date(y, m, 0)) };
  }
}

export function monthLabel(period) {
  const [y, m] = period.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return `${d.toLocaleString("en-US", { month: "short" })} '${y.slice(2)}`;
}

export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];