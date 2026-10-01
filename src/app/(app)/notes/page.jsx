// src/app/(app)/notes/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Plus,
  Search,
  StickyNote,
  Share2,
  Globe,
  FolderPlus,
  Trash2,
  Pencil,
} from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import NoteCard from "@/modules/notes/components/NoteCard";
import FolderDialog from "@/modules/notes/components/FolderDialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/core/utils/cn";

export default function NotesPage() {
  const [search, setSearch] = useState("");
  const {
    data: tree,
    isLoading: treeLoading,
    mutate: mutateTree,
  } = useSWR("/api/notes/tree");
  const { data: stats } = useSWR("/api/notes/stats");
  const { data: searchData, isLoading: searchLoading } = useSWR(
    search ? `/api/notes?search=${encodeURIComponent(search)}` : null
  );

  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [confirmFolderDelete, setConfirmFolderDelete] = useState(null);

  const notes = tree?.notes ?? [];
  const folders = tree?.folders ?? [];

  const rootNotes = notes.filter((n) => !n.folderId);
  const notesInFolder = (folderId) =>
    notes.filter((n) => n.folderId === folderId);

  const searching = search.trim().length > 0;
  const searchResults = searchData?.notes ?? [];

  const handleDeleteFolder = async () => {
    if (!confirmFolderDelete) return;
    const res = await fetch(`/api/folders/${confirmFolderDelete.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success(`Folder "${confirmFolderDelete.name}" deleted`);
      setConfirmFolderDelete(null);
      mutateTree();
    } else {
      toast.error("Couldn't delete folder");
    }
  };

  // Move a note out of any folder when dropped on the root section
  const handleRootDrop = async (e) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/note-id");
    if (!noteId) return;

    const res = await fetch(`/api/notes/${noteId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: null }),
    });
    if (res.ok) {
      toast.success("Moved to Open notes");
      mutateTree();
    } else {
      toast.error("Couldn't move note");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Notes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your private workspace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => {
              setEditingFolder(null);
              setShowFolderDialog(true);
            }}
          >
            <FolderPlus className="h-4 w-4" />
            New folder
          </Button>
          <Link href="/notes/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New note
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={StickyNote}
          label="My notes"
          value={stats?.mine ?? "—"}
          loading={!stats}
          accent="from-primary to-magenta-500"
        />
        <StatCard
          icon={Share2}
          label="Shared with others"
          value={stats?.shared ?? "—"}
          loading={!stats}
          accent="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Globe}
          label="Public links"
          value={stats?.publicLinks ?? "—"}
          loading={!stats}
          accent="from-amber-500 to-orange-500"
        />
      </div>

      {/* Search */}
      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="h-11 pl-9"
        />
      </div>

      {/* Content */}
      <div className="mt-8">
        {searching ? (
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            onDeleted={mutateTree}
          />
        ) : treeLoading ? (
          <GridSkeleton />
        ) : (
          <div className="space-y-10">
            {/* ── Root notes section (also acts as a drop zone to move out of folders) ── */}
            <section
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleRootDrop}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Open notes
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {rootNotes.length}
                  </span>
                </h2>
              </div>

              {rootNotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No root notes.{" "}
                  <Link href="/notes/new" className="text-primary hover:underline">
                    Create one
                  </Link>{" "}
                  or add notes to a folder below.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {rootNotes.map((n) => (
                    <NoteCard
                      key={n.id}
                      note={n}
                      onDelete={async () => {
                        await fetch(`/api/notes/${n.id}`, {
                          method: "DELETE",
                        });
                        mutateTree();
                      }}
                      onTogglePin={async () => {
                        await fetch(`/api/notes/${n.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isPinned: !n.isPinned }),
                        });
                        mutateTree();
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── Divider ── */}
            {folders.length > 0 && (
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden
                >
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Folders
                  </span>
                </div>
              </div>
            )}

            {/* ── Folders ── */}
            {folders.length > 0 && (
              <section>
                <div className="grid gap-5 md:grid-cols-2">
                  {folders
                    .filter((f) => !f.parentId)
                    .map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        notes={notesInFolder(folder.id)}
                        allFolders={folders}
                        onEdit={() => {
                          setEditingFolder(folder);
                          setShowFolderDialog(true);
                        }}
                        onDelete={() => setConfirmFolderDelete(folder)}
                        onChanged={mutateTree}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <FolderDialog
        open={showFolderDialog}
        onClose={() => {
          setShowFolderDialog(false);
          setEditingFolder(null);
        }}
        initial={editingFolder}
        folders={folders}
        onSaved={mutateTree}
      />

      <ConfirmDialog
        open={!!confirmFolderDelete}
        onClose={() => setConfirmFolderDelete(null)}
        onConfirm={handleDeleteFolder}
        title={`Delete folder "${confirmFolderDelete?.name}"?`}
        description={`Notes inside this folder (${confirmFolderDelete ? notesInFolder(confirmFolderDelete.id).length : 0}) will be moved to Open notes. The folder itself will be removed.`}
        confirmLabel="Delete folder"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function FolderCard({
  folder,
  notes,
  allFolders,
  onEdit,
  onDelete,
  onChanged,
}) {
  const Icon = Icons[folder.icon] ?? Icons.Folder;
  const subFolders = allFolders.filter((f) => f.parentId === folder.id);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const noteId = e.dataTransfer.getData("text/note-id");
    if (!noteId) return;

    const res = await fetch(`/api/notes/${noteId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: folder.id }),
    });
    if (res.ok) {
      toast.success(`Moved to ${folder.name}`);
      onChanged?.();
    } else {
      toast.error("Couldn't move note");
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card transition-all",
        dragOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/40"
          : "border-border/70 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 p-4">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            backgroundColor: (folder.color ?? "#a855f7") + "20",
            color: folder.color ?? "#a855f7",
          }}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{folder.name}</div>
          <div className="text-xs text-muted-foreground">
            {notes.length} note{notes.length === 1 ? "" : "s"}
            {subFolders.length > 0 &&
              ` · ${subFolders.length} subfolder${subFolders.length === 1 ? "" : "s"}`}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <Link
            href={`/notes/new?folder=${folder.id}`}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label={`New note in ${folder.name}`}
            title="New note in folder"
          >
            <Plus className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={onEdit}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
            aria-label="Edit folder"
            title="Edit folder"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete folder"
            title="Delete folder"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="p-3">
        {notes.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            Empty folder — drag a note here or click + to create one
          </p>
        ) : (
          <ul className="space-y-0.5">
            {notes.slice(0, 5).map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notes/${n.id}`}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition hover:bg-accent"
                >
                  {n.isPinned && (
                    <span className="text-primary" aria-hidden>
                      📌
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </Link>
              </li>
            ))}
            {notes.length > 5 && (
              <li>
                <div className="px-2.5 py-1.5 text-[11px] text-muted-foreground">
                  +{notes.length - 5} more
                </div>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function SearchResults({ results, loading, onDeleted }) {
  if (loading) return <GridSkeleton />;
  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        No notes match your search.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {results.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onDelete={async () => {
            await fetch(`/api/notes/${n.id}`, { method: "DELETE" });
            onDeleted();
          }}
          onTogglePin={async () => {
            await fetch(`/api/notes/${n.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isPinned: !n.isPinned }),
            });
            onDeleted();
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
          <Skeleton className="mt-4 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function StatCard({ icon: Icon, label, value, loading, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]">
      <div
        className={cn(
          "absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          accent
        )}
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            accent
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold tabular-nums">
            {loading ? <Skeleton className="h-6 w-12" /> : value}
          </div>
        </div>
      </div>
    </div>
  );
}