// src/modules/notes/components/SaveNoteDialog.jsx
"use client";

import { useEffect, useState } from "react";
import { X, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SaveNoteDialog({
  open,
  onClose,
  initialTitle,
  fallbackTitle,
  onSave,
}) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setTitle(initialTitle || fallbackTitle || "Untitled");
  }, [open, initialTitle, fallbackTitle]);

  if (!open) return null;

  const submit = async () => {
    setSaving(true);
    try {
      await onSave(title.trim() || fallbackTitle || "Untitled");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-2xl border border-border/70 bg-popover p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Save note</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="mt-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Leave blank to use the first line of your note.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save note"}
          </Button>
        </div>
      </div>
    </div>
  );
}