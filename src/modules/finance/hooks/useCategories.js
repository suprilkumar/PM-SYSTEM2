// src/modules/finance/hooks/useCategories.js
"use client";
import { useEffect, useState, useCallback } from "react";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, reload: load };
}