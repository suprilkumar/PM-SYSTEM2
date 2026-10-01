// src/modules/notes/hooks/useAutosave.js
"use client";
import { useEffect, useRef } from "react";
import { isEditorEmpty } from "../lib/editor";

export function useAutosave(noteId, payload, { delay = 800, enabled = true } = {}) {
  const timer = useRef();
  const first = useRef(true);

  useEffect(() => {
    if (!enabled || !noteId || !payload) return;

    // Never autosave an entirely empty note
    if (isEditorEmpty(payload.content?.html)) return;

    if (first.current) {
      first.current = false;
      return;
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn("[autosave]", err);
      }
    }, delay);

    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, JSON.stringify(payload), delay, enabled]);
}