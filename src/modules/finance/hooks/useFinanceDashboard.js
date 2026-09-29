// src/modules/finance/hooks/useFinanceDashboard.js
"use client";
import { useEffect, useState, useCallback } from "react";

export function useFinanceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}