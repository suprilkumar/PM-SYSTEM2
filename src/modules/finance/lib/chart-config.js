// src/modules/finance/lib/chart-config.js
export const TOOLTIP_STYLE = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  padding: "8px 12px",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.2)",
};

export const AXIS_STYLE = {
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  stroke: "hsl(var(--muted-foreground))",
};

/**
 * Pre-curated palette. Order is intentionally non-monotonic in hue so that
 * even 6-8 adjacent chart segments look clearly different.
 */
const PALETTE = [
  "#e11d48", // 0 rose
  "#f97316", // 1 orange
  "#06b6d4", // 2 cyan
  "#8b5cf6", // 3 violet
  "#10b981", // 4 emerald
  "#ec4899", // 5 pink
  "#eab308", // 6 yellow
  "#3b82f6", // 7 blue
  "#84cc16", // 8 lime
  "#a855f7", // 9 purple
  "#14b8a6", // 10 teal
  "#f43f5e", // 11 red-rose
  "#6366f1", // 12 indigo
  "#fb923c", // 13 orange-lite
  "#22d3ee", // 14 cyan-lite
  "#c084fc", // 15 purple-lite
  "#4ade80", // 16 green
  "#f472b6", // 17 pink-lite
  "#facc15", // 18 amber
  "#60a5fa", // 19 blue-lite
  "#2dd4bf", // 20 teal-lite
  "#fb7185", // 21 rose-lite
  "#818cf8", // 22 indigo-lite
  "#fbbf24", // 23 amber-lite
];

export const CHART_COLORS = PALETTE;

/**
 * Deterministic color by index. If two categories share a color, it's because
 * you have more series than palette entries — in practice, categories shown
 * per chart are capped well below the palette size.
 */
export function colorFor(index) {
  return PALETTE[index % PALETTE.length];
}

/**
 * A stable, string-keyed color. Two different names never share a color as
 * long as the palette has room. Ideal for category names that persist.
 */
const colorCache = new Map();
export function colorForName(name) {
  if (!name) return "#94a3b8";
  if (colorCache.has(name)) return colorCache.get(name);
  const idx = colorCache.size;
  const c = PALETTE[idx % PALETTE.length];
  colorCache.set(name, c);
  return c;
}