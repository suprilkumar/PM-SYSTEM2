// src/app/(app)/notes/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import useSWR from "swr";
import NoteEditor from "@/modules/notes/components/NoteEditor";
import SaveNoteDialog from "@/modules/notes/components/SaveNoteDialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAutosave } from "@/modules/notes/hooks/useAutosave";
import {
  normalizeContent,
  extractTitleFromHtml,
  isEditorEmpty,
  resolveTitle,
} from "@/modules/notes/lib/editor";
import { Button } from "@/components/ui/button";
import { Save, SaveAll, Share2, Trash2 } from "lucide-react";
import { cn } from "@/core/utils/cn";

export default function NotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSave, setShowSave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { mutate: mutateTree } = useSWR("/api/notes/tree");
  const { data: tree } = useSWR("/api/notes/tree");
  const folder = tree?.folders?.find((f) => f.id === note?.folderId);

  // Load the note
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
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
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Autosave (skips empty content internally)
  useAutosave(
    id,
    content ? { title, content, plainText: content.plainText } : null,
    { enabled: !!content, delay: 800 }
  );

  const empty = isEditorEmpty(content?.html);
  const effectiveTitle = resolveTitle(title, content?.html) || "Untitled";

  const doSave = async (finalTitle) => {
    if (isEditorEmpty(content?.html)) {
      toast.error("Can't save an empty note — write something first");
      return;
    }
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          content,
          plainText: content?.plainText ?? "",
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setTitle(finalTitle);
      toast.success(`Note "${finalTitle}" saved`);
      mutateTree();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`Note "${effectiveTitle}" deleted`);
      router.push("/notes");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-6 py-8 md:px-10">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton mt-6 h-12 w-2/3 rounded-lg" />
        <div className="skeleton mt-6 h-[60vh] w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6 md:p-10">
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
    <div className="mx-auto w-full max-w-[1100px] px-6 py-6 md:px-10 md:py-8">
      {folder && (
      <nav className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Link href="/notes" className="hover:text-foreground">
          Notes
        </Link>
        <span>›</span>
        <Link
          href={`/notes?folder=${folder.id}`}
          className="hover:text-foreground"
        >
          {folder.name}
        </Link>
        <span>›</span>
        <span className="truncate font-medium text-foreground">
          {effectiveTitle}
        </span>
      </nav>
    )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/notes")}
        >
          ← Back
        </Button>

<div className="flex flex-wrap items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setConfirmDelete(true)}
    className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
  >
    <Trash2 className="h-4 w-4" />
    <span className="hidden sm:inline">Delete</span>
  </Button>

  <Button
    variant="outline"
    size="sm"
    onClick={async () => {
      if (empty) {
        toast.error("Can't save an empty note — write something first");
        return;
      }
      const finalTitle = title.trim() || resolveTitle("", content?.html) || "Untitled";
      await doSave(finalTitle);
      router.push("/notes");
    }}
    disabled={empty}
    className={cn("gap-1.5", empty && "opacity-50")}
    title={empty ? "Write something to save" : "Save and return to notes"}
  >
    <SaveAll className="h-4 w-4" />
    <span className="hidden sm:inline">Save & exit</span>
  </Button>

  <Button
    variant="outline"
    size="sm"
    onClick={async () => {
      if (empty) {
        toast.error("Can't save an empty note — write something first");
        return;
      }
      if (title.trim()) {
        await doSave(title.trim());
        return;
      }
      setShowSave(true);
    }}
    disabled={empty}
    className={cn("gap-1.5", empty && "opacity-50")}
  >
    <Save className="h-4 w-4" />
    Save
  </Button>

  <Link href={`/notes/${id}/share`}>
    <Button variant="outline" size="sm" className="gap-1.5">
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  </Link>
</div>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (or leave blank to use first line)"
        className="mt-8 w-full bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30 md:text-5xl"
      />

      {/* Editor */}
      <div className="mt-8 pb-16">
        <NoteEditor
          initialHtml={content?.html ?? ""}
          onChange={(next) => setContent(next)}
        />
      </div>

      {/* Dialogs */}
      <SaveNoteDialog
        open={showSave}
        onClose={() => setShowSave(false)}
        initialTitle={title}
        fallbackTitle={extractTitleFromHtml(content?.html)}
        onSave={async (finalTitle) => {
          await doSave(finalTitle);
          setShowSave(false);
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${effectiveTitle}"?`}
        description="The note will be moved to the trash."
        confirmLabel="Delete note"
      />
    </div>
  );
}