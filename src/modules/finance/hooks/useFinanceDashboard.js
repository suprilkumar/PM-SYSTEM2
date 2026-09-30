// src/modules/finance/hooks/useFinanceDashboard.js
"use client";
import useSWR from "swr";

export function useFinanceDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/finance/dashboard",
    { keepPreviousData: true }
  );
  return {
    data,
    loading: isLoading && !data,
    error: error?.message,
    reload: mutate,
  };
}