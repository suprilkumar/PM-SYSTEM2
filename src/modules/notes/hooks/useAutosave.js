// src/modules/notes/hooks/useAutosave.js
"use client";

import { useEffect, useRef } from "react";

export function useAutosave(noteId, payload, { delay = 800, enabled = true } = {}) {
  const timer = useRef();
  const first = useRef(true);

  useEffect(() => {
    if (!enabled || !noteId || !payload) return;

    // Skip the first run (initial load)
    if (first.current) {
      first.current = false;
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) console.warn("[autosave] failed:", res.status);
      } catch (err) {
        console.warn("[autosave] error:", err);
      }
    }, delay);

    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, JSON.stringify(payload), delay, enabled]);
}