// src/modules/finance/hooks/useMonthlyTransactions.js
"use client";
import useSWR from "swr";

function buildKey({ year, month, type, search }) {
  if (!year || !month) return null;
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (type) params.set("type", type);
  if (search) params.set("search", search);
  return `/api/finance/transactions?${params}`;
}

export function useMonthlyTransactions({ year, month, type, search }) {
  const { data, error, isLoading, mutate } = useSWR(
    buildKey({ year, month, type, search }),
    { keepPreviousData: true }
  );

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