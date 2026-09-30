// src/modules/finance/lib/cache.js
"use client";
import { mutate } from "swr";

/** Invalidate every cached finance key. Called after any write. */
export function invalidateFinanceCache() {
  return mutate(
    (key) =>
      typeof key === "string" &&
      (key.startsWith("/api/finance/") || key.startsWith("/api/notes/")),
    undefined,
    { revalidate: true }
  );
}