// src/app/(app)/notes/public-links/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Globe,
  Copy,
  Check,
  ExternalLink,
  Eye,
  Plus,
  Trash2,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { cn } from "@/core/utils/cn";

export default function PublicLinksPage() {
  const { data, isLoading, mutate } = useSWR("/api/notes/public-links");
  const notes = data?.notes ?? [];

  const [confirmDisable, setConfirmDisable] = useState(null);
  const [disabling, setDisabling] = useState(false);

  const handleDisable = async () => {
    if (!confirmDisable) return;
    setDisabling(true);
    try {
      const res = await fetch("/api/notes/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "public",
          noteId: confirmDisable.id,
          enable: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to disable public link");
      toast.success(`Public link disabled for "${confirmDisable.title}"`);
      setConfirmDisable(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDisabling(false);
    }
  };

  const totalViews = notes.reduce((sum, n) => sum + (n.viewCount ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Public links
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Notes visible to anyone with the URL
            </p>
          </div>
        </div>

        <Link href="/notes">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Share a note
          </Button>
        </Link>
      </div>

      {/* Stat mini-bar */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat
          label="Public notes"
          value={notes.length}
          loading={isLoading}
          accent="from-amber-500 to-orange-500"
        />
        <MiniStat
          label="Total views"
          value={totalViews}
          loading={isLoading}
          accent="from-primary to-magenta-500"
        />
        <MiniStat
          label="Most viewed"
          value={
            notes.length
              ? Math.max(...notes.map((n) => n.viewCount ?? 0))
              : 0
          }
          loading={isLoading}
          accent="from-blue-500 to-cyan-500"
        />
      </div>

      {/* List */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No public links"
            description="Open a note and enable Public access in its Share settings to create a link."
            ctaHref="/notes"
            ctaLabel="Browse notes"
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {notes.map((n) => (
              <PublicLinkCard
                key={n.id}
                note={n}
                onDisable={() => setConfirmDisable(n)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDisable}
        onClose={() => setConfirmDisable(null)}
        onConfirm={handleDisable}
        loading={disabling}
        title={`Disable public link for "${confirmDisable?.title}"?`}
        description="The link will stop working immediately. The note itself stays intact and only you can access it."
        confirmLabel="Disable link"
      />
    </div>
  );
}

function PublicLinkCard({ note, onDisable }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}${note.url}`
    : note.url;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-amber-500/40 hover:shadow-[0_0_32px_-12px_rgba(245,158,11,0.35)]">
      {/* Note info */}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-600">
          <Globe className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/notes/${note.id}`}
            className="line-clamp-1 font-semibold transition hover:text-primary"
          >
            {note.title}
          </Link>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {note.plainText || "Empty note"}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          <Eye className="h-3 w-3" />
          {note.viewCount ?? 0}
        </span>
      </div>

      {/* URL row */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border bg-muted/30 px-2.5 py-1.5">
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
          {url}
        </span>
        <button
          onClick={copy}
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-md transition",
            copied
              ? "bg-emerald-500/15 text-emerald-600"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
          aria-label="Copy link"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Meta + actions */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Updated{" "}
          {new Date(note.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>

        <div className="flex items-center gap-1">
          <Link
            href={note.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </Link>
          <button
            onClick={onDisable}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <Power className="h-3 w-3" />
            Disable
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, loading, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4">
      <div
        className={cn(
          "absolute right-0 top-0 h-16 w-16 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br opacity-20 blur-2xl",
          accent
        )}
      />
      <div className="relative">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">
          {loading ? <Skeleton className="h-7 w-10" /> : value}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, ctaHref, ctaLabel }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-600">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      {ctaHref && (
        <Link href={ctaHref} className="mt-4">
          <Button>{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}