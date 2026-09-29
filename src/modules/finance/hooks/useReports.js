// src/modules/finance/hooks/useReports.js
"use client";
import { useEffect, useState, useCallback } from "react";

export function useReports(range = "month") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/finance/reports?range=${range}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}