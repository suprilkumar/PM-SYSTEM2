// src/modules/finance/hooks/useReports.js
"use client";
import useSWR from "swr";

export function useReports(range = "month", overrides = {}) {
  const params = new URLSearchParams({ range });
  if (overrides.from) params.set("from", overrides.from);
  if (overrides.to) params.set("to", overrides.to);
  const key = `/api/finance/reports?${params}`;

  const { data, error, isLoading, mutate } = useSWR(key, {
    keepPreviousData: true,
    dedupingInterval: 30_000,
  });

  return {
    data,
    loading: isLoading && !data,
    error: error?.message,
    reload: mutate,
  };
}