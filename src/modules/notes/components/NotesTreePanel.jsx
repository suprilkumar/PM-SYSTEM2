// src/modules/notes/components/NotesTreePanel.jsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Pin,
  GripVertical,
  Globe,
  Plus,
} from "lucide-react";
import { cn } from "@/core/utils/cn";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotesTreePanel({ currentNoteId }) {
  const { data, isLoading, mutate } = useSWR("/api/notes/tree");
  const [collapsed, setCollapsed] = useState({});
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const notes = data?.notes ?? [];
  const folders = data?.folders ?? [];

  // ── Build tree ──
  const tree = useMemo(() => {
    const folderById = new Map(
      folders.map((f) => [f.id, { ...f, children: [], notes: [] }])
    );
    const roots = [];

    for (const f of folderById.values()) {
      if (f.parentId && folderById.has(f.parentId)) {
        folderById.get(f.parentId).children.push(f);
      } else {
        roots.push(f);
      }
    }

    const rootNotes = [];
    for (const n of notes) {
      if (n.folderId && folderById.has(n.folderId)) {
        folderById.get(n.folderId).notes.push(n);
      } else {
        rootNotes.push(n);
      }
    }

    const sortGroup = (arr) =>
      arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const sortNotes = (arr) =>
      arr.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      });

    for (const f of folderById.values()) {
      sortGroup(f.children);
      sortNotes(f.notes);
    }
    sortGroup(roots);
    sortNotes(rootNotes);

    return { roots, rootNotes };
  }, [folders, notes]);

  const pinnedNotes = notes.filter((n) => n.isPinned);

  // ── Reorder (within the same container) ──
  const onDragStart = (id) => (e) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (id) => (e) => {
    e.preventDefault();
    if (id && id !== dragId) setDropTarget(id);
  };

  const onDragEnd = () => {
    setDragId(null);
    setDropTarget(null);
  };

  const onDrop = async (targetId, container) => {
    if (!dragId || dragId === targetId) return onDragEnd();

    const ids = container.map((n) => n.id);
    const fromIdx = ids.indexOf(dragId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return onDragEnd();

    const next = [...ids];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragId);

    const updates = next.map((id, i) => ({ id, sortOrder: i }));

    mutate(
      (current) => {
        if (!current) return current;
        const orderMap = new Map(updates.map((u) => [u.id, u.sortOrder]));
        return {
          ...current,
          notes: current.notes.map((n) =>
            orderMap.has(n.id) ? { ...n, sortOrder: orderMap.get(n.id) } : n
          ),
        };
      },
      { revalidate: false }
    );

    onDragEnd();

    const res = await fetch("/api/notes/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) mutate();
  };

  // ── Move into / out of a folder ──
  const onDropOnFolder = async (folderId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragId) return;

    const draggedId = dragId;

    // Optimistic update
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          notes: current.notes.map((n) =>
            n.id === draggedId ? { ...n, folderId } : n
          ),
        };
      },
      { revalidate: false }
    );

    onDragEnd();

    const res = await fetch(`/api/notes/${draggedId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });

    if (!res.ok) {
      mutate();
      toast.error("Couldn't move note");
    } else {
      toast.success(folderId ? "Moved to folder" : "Moved out of folder");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-border/60 px-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Notes
        </span>
        <Link
          href="/notes/new"
          className="rounded-md px-2 py-1 text-xs text-primary transition hover:bg-primary/10"
        >
          + New
        </Link>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned */}
            {pinnedNotes.length > 0 && (
              <Section label="Pinned" count={pinnedNotes.length}>
                <NoteList
                  notes={pinnedNotes}
                  currentNoteId={currentNoteId}
                  dragId={dragId}
                  dropTarget={dropTarget}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragEnd={onDragEnd}
                  onDrop={(id) => onDrop(id, pinnedNotes)}
                />
              </Section>
            )}

            {/* Root notes — the whole section is a drop target for "move out" */}
            <Section label="Open notes" count={tree.rootNotes.length}>
              <div
                onDragOver={(e) => {
                  if (dragId) e.preventDefault();
                }}
                onDrop={(e) => onDropOnFolder(null, e)}
                className="min-h-[12px]"
              >
                {tree.rootNotes.length > 0 ? (
                  <NoteList
                    notes={tree.rootNotes}
                    currentNoteId={currentNoteId}
                    dragId={dragId}
                    dropTarget={dropTarget}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    onDrop={(id) => onDrop(id, tree.rootNotes)}
                  />
                ) : (
                  <div className="rounded-md border border-dashed px-2 py-3 text-center text-[10px] text-muted-foreground">
                    {dragId ? "Drop here to move out" : "No notes"}
                  </div>
                )}
              </div>
            </Section>

            {/* Folders */}
            {tree.roots.map((folder) => (
              <FolderNode
                key={folder.id}
                folder={folder}
                currentNoteId={currentNoteId}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                dragId={dragId}
                dropTarget={dropTarget}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
                onDropOnFolder={onDropOnFolder}
              />
            ))}

            {tree.roots.length === 0 &&
              tree.rootNotes.length === 0 &&
              pinnedNotes.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  No notes yet
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ label, count, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between px-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

function FolderNode({
  folder,
  currentNoteId,
  collapsed,
  setCollapsed,
  dragId,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onDropOnFolder,
}) {
  const isOpen = !collapsed[folder.id];
  const totalCount = folder.notes.length + folder.children.length;
  const Icon = isOpen ? FolderOpen : Folder;
  const [folderHover, setFolderHover] = useState(false);

  return (
    <div>
      {/* Folder header — click toggles, drop moves note in */}
      <div
        onDragOver={(e) => {
          if (dragId) {
            e.preventDefault();
            setFolderHover(true);
          }
        }}
        onDragLeave={() => setFolderHover(false)}
        onDrop={(e) => {
          setFolderHover(false);
          onDropOnFolder(folder.id, e);
        }}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition",
          folderHover
            ? "bg-primary/15 text-primary ring-2 ring-primary/40"
            : "hover:bg-accent"
        )}
      >
        <button
          onClick={() =>
            setCollapsed((c) => ({ ...c, [folder.id]: !c[folder.id] }))
          }
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
          aria-label={isOpen ? "Collapse folder" : "Expand folder"}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: folder.color ?? undefined }}
          />
          <span className="min-w-0 flex-1 truncate">{folder.name}</span>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {totalCount}
          </span>
        </button>

        <Link
          href={`/notes/new?folder=${folder.id}`}
          onClick={(e) => e.stopPropagation()}
          className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label={`New note in ${folder.name}`}
          title="New note in folder"
        >
          <Plus className="h-3 w-3" />
        </Link>
      </div>

      {isOpen && (
        <div className="ml-3 border-l border-border/50 pl-2">
          {/* Nested folders */}
          {folder.children.map((sub) => (
            <FolderNode
              key={sub.id}
              folder={sub}
              currentNoteId={currentNoteId}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              dragId={dragId}
              dropTarget={dropTarget}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              onDropOnFolder={onDropOnFolder}
            />
          ))}

          {/* Notes */}
          {folder.notes.length > 0 && (
            <NoteList
              notes={folder.notes}
              currentNoteId={currentNoteId}
              dragId={dragId}
              dropTarget={dropTarget}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragEnd={onDragEnd}
              onDrop={(id) => onDrop(id, folder.notes)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function NoteList({
  notes,
  currentNoteId,
  dragId,
  dropTarget,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}) {
  return (
    <ul className="space-y-0.5">
      {notes.map((n) => (
        <li key={n.id}>
          <NoteRow
            note={n}
            active={n.id === currentNoteId}
            dragging={dragId === n.id}
            isDropTarget={dropTarget === n.id}
            onDragStart={onDragStart(n.id)}
            onDragOver={onDragOver(n.id)}
            onDragEnd={onDragEnd}
            onDrop={() => onDrop(n.id)}
          />
        </li>
      ))}
    </ul>
  );
}

function NoteRow({
  note,
  active,
  dragging,
  isDropTarget,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={cn(
        "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition",
        active
          ? "bg-gradient-to-r from-primary/15 to-magenta-500/5 font-medium text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        dragging && "opacity-40",
        isDropTarget && "ring-2 ring-primary/40"
      )}
    >
      <GripVertical className="h-3 w-3 shrink-0 cursor-grab text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
      {note.isPinned && <Pin className="h-3 w-3 shrink-0 fill-current" />}
      <Link
        href={`/notes/${note.id}`}
        className="min-w-0 flex-1 truncate"
        onClick={(e) => e.stopPropagation()}
      >
        {note.title}
      </Link>
      {note.isPublic && <Globe className="h-3 w-3 shrink-0 text-amber-500" />}
    </div>
  );
}