// src/modules/finance/lib/cache.js
"use client";
import { mutate } from "swr";

/**
 * Invalidate every cached /api/finance/* SWR key.
 * Call this right after a successful POST/PATCH/DELETE from a client component.
 */
export function invalidateFinanceCache() {
  return mutate(
    (key) =>
      typeof key === "string" && key.startsWith("/api/finance/"),
    undefined,
    { revalidate: true }
  );
}