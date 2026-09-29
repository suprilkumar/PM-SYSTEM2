// src/modules/finance/hooks/useTransactions.js
"use client";
import { useEffect, useState, useCallback } from "react";

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
      });
      const res = await fetch(`/api/finance/transactions?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setTransactions(data.transactions ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
  };

  return { transactions, loading, error, reload: load, remove };
}