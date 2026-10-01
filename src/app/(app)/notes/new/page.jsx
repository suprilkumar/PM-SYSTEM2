"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import NoteEditor from "@/modules/notes/components/NoteEditor";
import { emptyDoc, editorToPlainText, isEditorEmpty, resolveTitle } from "@/modules/notes/lib/editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewNotePage() {
  const router = useRouter();
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">New note</h1>
        <Button
          onClick={save}
          disabled={saving || empty}
          className="gap-1.5"
          title={empty ? "Write something to save" : "Save note"}
        >
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