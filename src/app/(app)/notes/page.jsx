// src/app/(app)/notes/page.js
"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNotes } from "@/modules/notes/hooks/useNotes";
import NoteCard from "@/modules/notes/components/NoteCard";
import NotesEmptyState from "@/modules/notes/components/NotesEmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const { notes, loading, remove, togglePin } = useNotes({ search });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link href="/notes/new">
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="pl-9"
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!loading && notes.length === 0 && <NotesEmptyState />}

      <div className="grid gap-3 sm:grid-cols-2">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onDelete={() => remove(note.id)}
            onTogglePin={() => togglePin(note.id, !note.isPinned)}
          />
        ))}
      </div>
    </div>
  );
}