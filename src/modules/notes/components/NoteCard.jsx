// src/modules/notes/components/NoteCard.jsx
"use client";
import Link from "next/link";
import { Pin, Trash2, MoreVertical } from "lucide-react";
import { fmtRelative } from "@/core/utils/date";

export default function NoteCard({ note, onDelete, onTogglePin }) {
  return (
    <div
      className="group relative rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md"
      style={{ backgroundColor: note.color || undefined }}
    >
      <Link href={`/notes/${note.id}`} className="block">
        <h3 className="line-clamp-1 font-semibold">{note.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {note.plainText || "Empty note"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{fmtRelative(note.updatedAt)}</p>
      </Link>

      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button onClick={onTogglePin} className="rounded-md p-1.5 hover:bg-accent" aria-label="Pin">
          <Pin className={`h-4 w-4 ${note.isPinned ? "fill-current text-primary" : ""}`} />
        </button>
        <button onClick={onDelete} className="rounded-md p-1.5 hover:bg-accent" aria-label="Delete">
          <Trash2 className="h-4 w-4 text-destructive" />
        </button>
      </div>
    </div>
  );
}