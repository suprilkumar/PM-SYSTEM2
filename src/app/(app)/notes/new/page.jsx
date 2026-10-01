"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import NoteEditor from "@/modules/notes/components/NoteEditor";
import {
  emptyDoc,
  editorToPlainText,
  isEditorEmpty,
  resolveTitle,
} from "@/modules/notes/lib/editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import Link from "next/link";

export default function NewNotePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}>
      <NewNoteForm />
    </Suspense>
  );
}

function NewNoteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const folderId = params.get("folder");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(emptyDoc());
  const [saving, setSaving] = useState(false);

  const empty = isEditorEmpty(content?.html);

  const save = async () => {
    if (empty) {
      toast.error("Can't save an empty note — write something first");
      return;
    }
    setSaving(true);
    const finalTitle = resolveTitle(title, content.html) || "Untitled";

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: finalTitle,
        content,
        plainText: content.plainText ?? editorToPlainText(content.html),
        folderId: folderId || null,
      }),
    });
    setSaving(false);

    if (res.ok) {
      const note = await res.json();
      toast.success(`Note "${finalTitle}" created`);
      router.replace(`/notes/${note.id}`);
    } else {
      toast.error("Failed to create note");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {/* Breadcrumb */}
      {folderId && (
        <div className="text-xs text-muted-foreground">
          <Link href="/notes" className="hover:text-foreground">
            Notes
          </Link>
          <span className="mx-1">›</span>
          <span className="text-foreground">New note</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">New note</h1>
        <Button onClick={save} disabled={saving || empty}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (or leave blank to use first line)"
        className="text-lg font-semibold"
      />

      <NoteEditor initialHtml="" onChange={(next) => setContent(next)} />
    </div>
  );
}