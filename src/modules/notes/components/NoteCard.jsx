// src/modules/notes/components/NoteCard.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Pin, Trash2, Globe } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { fmtRelative } from "@/core/utils/date";
import { cn } from "@/core/utils/cn";

export default function NoteCard({ note, onDelete, onTogglePin }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete?.();
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/note-id", note.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all",
          "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]",
          "cursor-grab active:cursor-grabbing"
        )}
      >
        {note.isPublic && (
          <div className="absolute right-3 top-3 flex items-center gap-1">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/15 text-amber-600">
              <Globe className="h-3 w-3" />
            </span>
          </div>
        )}

        <Link href={`/notes/${note.id}`} className="block flex-1">
          <h3
            className={cn(
              "line-clamp-1 pr-6 font-semibold transition",
              note.isPinned && "text-primary"
            )}
          >
            {note.isPinned && (
              <Pin className="mr-1 inline h-3.5 w-3.5 fill-current" />
            )}
            {note.title}
          </h3>
          <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground">
            {note.plainText || "Empty note"}
          </p>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {fmtRelative(note.updatedAt)}
          </span>
          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button
              onClick={onTogglePin}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
              aria-label={note.isPinned ? "Unpin note" : "Pin note"}
            >
              <Pin className={cn("h-3.5 w-3.5", note.isPinned && "fill-current")} />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete note"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title={`Delete "${note.title}"?`}
        description="This note will be moved to the trash. You can restore it later, but permanent deletion happens after 30 days."
        confirmLabel="Delete note"
      />
    </>
  );
}