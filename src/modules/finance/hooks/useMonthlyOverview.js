// src/modules/finance/hooks/useMonthlyOverview.js
"use client";
import useSWR from "swr";

export function useMonthlyOverview(year) {
  const { data, error, isLoading, mutate } = useSWR(
    year ? `/api/finance/monthly?year=${year}` : null,
    { keepPreviousData: true }
  );

  return {
    data,
    loading: isLoading && !data,
    error: error?.message,
    reload: mutate,
  };
}