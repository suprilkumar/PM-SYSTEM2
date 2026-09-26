// src/modules/notes/components/NotesEmptyState.jsx
import Link from "next/link";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <StickyNote className="mb-3 h-10 w-10 text-muted-foreground" />
      <h3 className="font-semibold">No notes yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">Create your first note to get started.</p>
      <Link href="/notes/new"><Button>Create note</Button></Link>
    </div>
  );
}