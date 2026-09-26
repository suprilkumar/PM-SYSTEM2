// src/app/(app)/notes/new/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/modules/notes/components/NoteEditor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { emptyDoc } from "@/modules/notes/lib/editor";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(emptyDoc());
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Untitled",
        content,
        plainText: content.plainText,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const note = await res.json();
      router.replace(`/notes/${note.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">New note</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="text-lg font-semibold"
      />

      <NoteEditor
        initialHtml=""
        onChange={(next) => setContent(next)}
      />
    </div>
  );
}