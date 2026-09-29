// src/modules/finance/hooks/useMonthlyTransactions.js
"use client";
import { useEffect, useState, useCallback } from "react";

export function useMonthlyTransactions({ year, month, type, search }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        year: String(year),
        month: String(month),
      });
      if (type) params.set("type", type);
      if (search) params.set("search", search);

      const res = await fetch(`/api/finance/transactions?${params}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setTransactions(json.transactions ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, month, type, search]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/finance/transactions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) load();
  };

  return { transactions, loading, error, reload: load, remove };
}