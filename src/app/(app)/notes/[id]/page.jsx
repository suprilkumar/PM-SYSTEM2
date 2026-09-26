// src/app/(app)/notes/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import NoteEditor from "@/modules/notes/components/NoteEditor";
import { useAutosave } from "@/modules/notes/hooks/useAutosave";
import { normalizeContent } from "@/modules/notes/lib/editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/notes/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        const normalized = normalizeContent(data.content);
        setNote(data);
        setTitle(data.title);
        setContent(normalized);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useAutosave(id, content ? { title, content, plainText: content.plainText } : null, {
    enabled: !!content,
    delay: 800,
  });

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-destructive">
          Couldn't load this note ({error}).
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/notes")}
          className="mt-3"
        >
          Back to notes
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push("/notes")}>
          ← Back
        </Button>
        <Link href={`/notes/${id}/share`}>
          <Button variant="outline" size="sm">
            Share
          </Button>
        </Link>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        className="text-lg font-semibold"
      />

      <NoteEditor
        initialHtml={content?.html ?? ""}
        onChange={(next) => setContent(next)}
      />
    </div>
  );
}