// src/modules/notes/hooks/useNotes.js
"use client";
import { useEffect, useState, useCallback } from "react";

export function useNotes({ search = "", archived = false } = {}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, archived: String(archived) });
      const res = await fetch(`/api/notes?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotes(data.notes);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, archived]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
  };

  const togglePin = async (id, isPinned) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned } : n)));
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPinned }),
    });
  };

  return { notes, loading, error, reload: load, remove, togglePin };
}