// src/modules/finance/hooks/useTransactions.js
"use client";
import useSWR from "swr";

export function useTransactions(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const key = `/api/finance/transactions?${params}`;

  const { data, error, isLoading, mutate } = useSWR(key, {
    keepPreviousData: true,
  });

  const transactions = data?.transactions ?? [];

  const remove = async (id) => {
    mutate(
      (current) =>
        current
          ? {
              ...current,
              transactions: current.transactions.filter((t) => t.id !== id),
            }
          : current,
      { revalidate: false }
    );
    const res = await fetch(`/api/finance/transactions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) mutate();
  };

  return {
    transactions,
    loading: isLoading && !data,
    error: error?.message,
    reload: mutate,
    remove,
  };
}