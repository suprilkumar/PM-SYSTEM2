// src/app/(app)/notes/shared/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Share2,
  Copy,
  Check,
  Link2,
  Trash2,
  Plus,
  Mail,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { cn } from "@/core/utils/cn";

export default function SharedNotesPage() {
  const { data, isLoading, mutate } = useSWR("/api/notes/shared-by-me");
  const shares = data?.shares ?? [];

  const [confirmShare, setConfirmShare] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!confirmShare) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/notes/shares/${confirmShare.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke");
      toast.success(`Sharing with ${confirmShare.email} stopped`);
      setConfirmShare(null);
      mutate();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <Share2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Shared by me
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Notes you've shared with specific people
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
          label="Active shares"
          value={shares.length}
          loading={isLoading}
          accent="from-blue-500 to-cyan-500"
        />
        <MiniStat
          label="Accepted"
          value={shares.filter((s) => s.status === "accepted").length}
          loading={isLoading}
          accent="from-emerald-500 to-green-500"
        />
        <MiniStat
          label="Pending"
          value={shares.filter((s) => s.status === "pending").length}
          loading={isLoading}
          accent="from-amber-500 to-orange-500"
        />
      </div>

      {/* Shares list */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : shares.length === 0 ? (
          <EmptyState
            icon={Share2}
            title="No shares yet"
            description="Open a note and click Share to send it to someone by email."
            ctaHref="/notes"
            ctaLabel="Browse notes"
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {shares.map((s) => (
              <ShareCard
                key={s.id}
                share={s}
                onRevoke={() => setConfirmShare(s)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmShare}
        onClose={() => setConfirmShare(null)}
        onConfirm={handleRevoke}
        loading={revoking}
        title={`Stop sharing with ${confirmShare?.email}?`}
        description={`They will no longer be able to access "${confirmShare?.note.title}". The link will be invalidated immediately.`}
        confirmLabel="Stop sharing"
      />
    </div>
  );
}

function ShareCard({ share, onRevoke }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}${share.url}`
    : share.url;

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

  const statusTone =
    share.status === "accepted"
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
      : "bg-amber-500/15 text-amber-600 dark:text-amber-400";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-glow)]">
      {/* Note info */}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
          <Link2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            href={`/notes/${share.note.id}`}
            className="line-clamp-1 font-semibold transition hover:text-primary"
          >
            {share.note.title}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{share.email}</span>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
            statusTone
          )}
        >
          {share.status}
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
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(share.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="capitalize">{share.role}</span>
        </div>

        <button
          onClick={onRevoke}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
          Stop sharing
        </button>
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
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
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