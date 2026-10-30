// src/app/(app)/notes/page.jsx
"use client";

import { useState, useMemo } from "react";
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
  X,
  LayoutGrid,
  List,
  FolderOpen,
  Sparkles,
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

  const rootNotes = useMemo(
    () => notes.filter((n) => !n.folderId),
    [notes]
  );
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
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-magenta-500/5 to-transparent p-5 md:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Private workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Notes
            </h1>
            <p className="text-sm text-muted-foreground">
              {rootNotes.length + folders.length > 0
                ? `${notes.length} note${notes.length === 1 ? "" : "s"} across ${folders.length} folder${folders.length === 1 ? "" : "s"}`
                : "Capture ideas, organize thoughts, share what matters."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-border/70 bg-background/70 backdrop-blur hover:bg-accent"
              onClick={() => {
                setEditingFolder(null);
                setShowFolderDialog(true);
              }}
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Button>
            <Link href="/notes/new">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-magenta-500 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                New note
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
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

      {/* ── Search + toolbar ── */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="h-11 rounded-xl border-border/70 bg-card pl-10 pr-9 shadow-sm transition focus:shadow-md"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {searching && (
          <span className="text-xs text-muted-foreground">
            {searchLoading
              ? "Searching…"
              : `${searchResults.length} result${searchResults.length === 1 ? "" : "s"}`}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="mt-8">
        {searching ? (
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            onDeleted={mutateTree}
            query={search}
          />
        ) : treeLoading ? (
          <GridSkeleton />
        ) : (
          <div className="space-y-10">
            {/* Root notes */}
            <section
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleRootDrop}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                    <FolderOpen className="h-3.5 w-3.5" />
                  </span>
                  <h2 className="text-sm font-semibold tracking-tight">
                    Open notes
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                    {rootNotes.length}
                  </span>
                </div>
              </div>

              {rootNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-10 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <StickyNote className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">No open notes</p>
                    <p className="text-xs text-muted-foreground">
                      Create one, or add notes to a folder below.
                    </p>
                  </div>
                  <Link
                    href="/notes/new"
                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-magenta-500 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition hover:shadow-md active:scale-[0.98]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New note
                  </Link>
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

            {/* Divider */}
            {folders.length > 0 && (
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden
                >
                  <div className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="inline-flex items-center gap-1.5 bg-background px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <LayoutGrid className="h-3 w-3" />
                    Folders · {folders.length}
                  </span>
                </div>
              </div>
            )}

            {/* Folders */}
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
  const color = folder.color ?? "#a855f7";

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
        "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-200",
        dragOver
          ? "border-primary bg-primary/5 ring-2 ring-primary/40"
          : "border-border/70 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      {/* Gradient hairline on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-border/60 p-4">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: color + "20",
            color: color,
            "--tw-ring-color": color + "40",
          }}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{folder.name}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>
              {notes.length} note{notes.length === 1 ? "" : "s"}
            </span>
            {subFolders.length > 0 && (
              <>
                <span className="text-border">·</span>
                <span>
                  {subFolders.length} subfolder
                  {subFolders.length === 1 ? "" : "s"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
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
      <div className="p-2">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-2 py-6 text-center">
            <div
              className="grid h-9 w-9 place-items-center rounded-full"
              style={{ backgroundColor: color + "15", color }}
            >
              <FolderOpen className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              Empty folder — drag a note here
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {notes.slice(0, 5).map((n) => (
              <li key={n.id}>
                <Link
                  href={`/notes/${n.id}`}
                  className="group/note flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition hover:bg-accent"
                >
                  {n.isPinned ? (
                    <Icons.Pin className="h-3 w-3 shrink-0 fill-primary text-primary" />
                  ) : (
                    <Icons.FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate transition group-hover/note:text-foreground">
                    {n.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
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
                <Link
                  href={`/notes?folder=${folder.id}`}
                  className="flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-primary transition hover:bg-primary/10"
                >
                  +{notes.length - 5} more
                  <Icons.ChevronRight className="h-3 w-3" />
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function SearchResults({ results, loading, onDeleted, query }) {
  if (loading) return <GridSkeleton />;
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-12 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">No notes match "{query}"</p>
          <p className="text-xs text-muted-foreground">
            Try a different keyword or clear the search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {results.length} result{results.length === 1 ? "" : "s"} for{" "}
        <span className="font-medium text-foreground">"{query}"</span>
      </p>
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
    </div>
  );
}

/* ─────────────────────────────────────────────── */

function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/70 bg-card p-4"
        >
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
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
      <div
        aria-hidden
        className={cn(
          "absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
          accent
        )}
      />
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-105",
            accent
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <div className="mt-0.5 text-2xl font-bold tabular-nums leading-none tracking-tight">
            {loading ? <Skeleton className="h-6 w-12" /> : value}
          </div>
        </div>
      </div>
    </div>
  );
}