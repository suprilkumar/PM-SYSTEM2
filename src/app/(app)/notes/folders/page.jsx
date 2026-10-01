// src/app/(app)/notes/folders/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import * as Icons from "lucide-react";
import {
  FolderPlus, ChevronDown, Plus, Pencil, Trash2, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { emit } from "@/core/utils/events";
import { cn } from "@/core/utils/cn";

export default function FoldersPage() {
  const { data, isLoading, mutate } = useSWR("/api/notes/tree");
  const folders = data?.folders ?? [];
  const notes = data?.notes ?? [];

  const [open, setOpen] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const notesOf = (folderId) => notes.filter((n) => n.folderId === folderId);
  const subfoldersOf = (folderId) =>
    folders.filter((f) => f.parentId === folderId);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/folders/${confirmDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Folder "${confirmDelete.name}" deleted`);
      setConfirmDelete(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const topFolders = folders.filter((f) => !f.parentId);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-magenta-500 text-white shadow-sm">
            <Icons.Folders className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Folders
            </h1>
            <p className="text-sm text-muted-foreground">
              {folders.length} folder{folders.length === 1 ? "" : "s"} ·{" "}
              {notes.length} note{notes.length === 1 ? "" : "s"} total
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => emit("notes:new-folder", {})}
        >
          <FolderPlus className="h-4 w-4" />
          New folder
        </Button>
      </div>

      {/* List */}
      <div className="mt-8 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : topFolders.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <Icons.Folders className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No folders yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a folder to organize your notes.
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => emit("notes:new-folder", {})}
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Button>
          </div>
        ) : (
          topFolders.map((folder) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              notes={notesOf(folder.id)}
              subfolders={subfoldersOf(folder.id)}
              open={!!open[folder.id]}
              onToggle={() =>
                setOpen((o) => ({ ...o, [folder.id]: !o[folder.id] }))
              }
              onEdit={() => emit("notes:edit-folder", { folderId: folder.id })}
              onDelete={() => setConfirmDelete(folder)}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete folder "${confirmDelete?.name}"?`}
        description={`This will delete the folder and move its ${notesOf(confirmDelete?.id).length} note(s) out to Open notes. Notes are not deleted.`}
        confirmLabel="Delete folder"
      />
    </div>
  );
}

function FolderRow({ folder, notes, subfolders, open, onToggle, onEdit, onDelete }) {
  const Icon = Icons[folder.icon] ?? Icons.Folder;
  const totalCount = notes.length + subfolders.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:border-primary/30">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              !open && "-rotate-90"
            )}
          />
        </button>

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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {notes.length} note{notes.length === 1 ? "" : "s"}
              {subfolders.length > 0 &&
                ` · ${subfolders.length} subfolder${subfolders.length === 1 ? "" : "s"}`}
            </span>
            <span>
              Created{" "}
              {new Date(folder.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Link
            href={`/notes/new?folder=${folder.id}`}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="New note in folder"
            title="New note in folder"
          >
            <Plus className="h-4 w-4" />
          </Link>
          <button
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Rename folder"
            title="Rename"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete folder"
            title="Delete folder"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-border/60 bg-muted/20 p-3">
          {totalCount === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Empty folder
            </p>
          ) : (
            <ul className="space-y-0.5">
              {subfolders.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/notes?folder=${sub.id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-accent"
                  >
                    <Icons.Folder className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{sub.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {notes.filter((n) => n.folderId === sub.id).length} notes
                    </span>
                  </Link>
                </li>
              ))}
              {notes.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/notes/${n.id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-accent"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
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
            </ul>
          )}
        </div>
      )}
    </div>
  );
}