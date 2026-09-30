// src/modules/finance/hooks/useCategories.js
"use client";
import useSWR from "swr";

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/finance/categories",
    { revalidateOnFocus: false, dedupingInterval: 60_000 }
  );

  return {
    categories: data?.categories ?? [],
    loading: isLoading && !data,
    error: error?.message,
    reload: mutate,
  };
}