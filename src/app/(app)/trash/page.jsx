// src/app/(app)/trash/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Trash2,
  RotateCcw,
  StickyNote,
  Wallet,
  AlertTriangle,
  Clock,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import CategoryIcon from "@/modules/finance/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, tone } from "@/modules/finance/lib/format";
import { invalidateFinanceCache } from "@/modules/finance/lib/cache";
import { cn } from "@/core/utils/cn";

const RETENTION_DAYS = 30;

export default function TrashPage() {
  const [tab, setTab] = useState("transactions");
  const {
    data: txnData,
    isLoading: txLoading,
    mutate: mutateTx,
  } = useSWR(tab === "transactions" ? "/api/finance/transactions/trash" : null);
  const {
    data: noteData,
    isLoading: noteLoading,
    mutate: mutateNotes,
  } = useSWR(tab === "notes" ? "/api/notes/trash" : null);

  const [confirmPurge, setConfirmPurge] = useState(null);
  const [purging, setPurging] = useState(false);

  const transactions = txnData?.transactions ?? [];
  const notes = noteData?.notes ?? [];

  const handleRestoreTransaction = async (id) => {
    const res = await fetch("/api/finance/transactions/trash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Transaction restored");
      mutateTx();
      await invalidateFinanceCache();
    } else {
      toast.error("Couldn't restore");
    }
  };

  const handleRestoreNote = async (id) => {
    const res = await fetch("/api/notes/trash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Note restored");
      mutateNotes();
    } else {
      toast.error("Couldn't restore");
    }
  };

  const handlePurge = async () => {
    if (!confirmPurge) return;
    setPurging(true);
    try {
      const url = confirmPurge.kind === "transaction"
        ? "/api/finance/transactions/trash"
        : "/api/notes/trash";
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmPurge.id }),
      });
      if (res.ok) {
        toast.success("Permanently deleted");
        if (confirmPurge.kind === "transaction") {
          mutateTx();
          await invalidateFinanceCache();
        } else {
          mutateNotes();
        }
        setConfirmPurge(null);
      } else {
        toast.error("Couldn't delete");
      }
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Trash"
        description={`Items are permanently deleted after ${RETENTION_DAYS} days`}
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Trash" }]}
        showBack={false}
      />

      {/* Info banner */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="text-xs">
          <div className="font-medium text-amber-900 dark:text-amber-200">
            Auto-deletion
          </div>
          <div className="mt-0.5 text-amber-800/80 dark:text-amber-200/80">
            Everything in Trash is permanently deleted after {RETENTION_DAYS} days.
            Restore before then if you need it back.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex rounded-lg border bg-background p-0.5 w-fit">
        {[
          { v: "transactions", label: "Transactions", icon: Wallet, count: transactions.length },
          { v: "notes", label: "Notes", icon: StickyNote, count: notes.length },
        ].map(({ v, label, icon: Icon, count }) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition md:px-4 md:py-2 md:text-sm",
              tab === v
                ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {((v === "transactions" && !txLoading) ||
              (v === "notes" && !noteLoading)) && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 text-[10px] tabular-nums",
                  tab === v
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === "transactions" ? (
          txLoading ? (
            <SkeletonList />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No deleted transactions"
              description="Transactions you delete will show up here for 30 days."
            />
          ) : (
            <div className="divide-y overflow-hidden rounded-2xl border border-border/70 bg-card">
              {transactions.map((t) => (
                <TxnTrashRow
                  key={t.id}
                  txn={t}
                  onRestore={() => handleRestoreTransaction(t.id)}
                  onPurge={() =>
                    setConfirmPurge({ id: t.id, kind: "transaction", label: t.category?.name })
                  }
                />
              ))}
            </div>
          )
        ) : noteLoading ? (
          <SkeletonList />
        ) : notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="No deleted notes"
            description="Notes you delete will show up here for 30 days."
          />
        ) : (
          <div className="divide-y overflow-hidden rounded-2xl border border-border/70 bg-card">
            {notes.map((n) => (
              <NoteTrashRow
                key={n.id}
                note={n}
                onRestore={() => handleRestoreNote(n.id)}
                onPurge={() =>
                  setConfirmPurge({ id: n.id, kind: "note", label: n.title })
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmPurge}
        onClose={() => setConfirmPurge(null)}
        onConfirm={handlePurge}
        loading={purging}
        title={`Permanently delete "${confirmPurge?.label}"?`}
        description="This cannot be undone. The item will be removed from the database immediately."
        confirmLabel="Delete forever"
      />
    </div>
  );
}

function TxnTrashRow({ txn, onRestore, onPurge }) {
  const isIncome = txn.type === "income";
  const t = tone[txn.type] ?? tone.neutral;
  const daysLeft = daysUntilPurge(txn.deletedAt);

  return (
    <div className="flex items-center gap-3 p-3">
      <span
        className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", t.bg)}
        style={{ color: txn.category?.color ?? undefined }}
      >
        <CategoryIcon name={txn.category?.icon ?? "Circle"} size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {txn.category?.name ?? "Unknown"}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {txn.description || "No description"}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className={cn("text-sm font-semibold tabular-nums", t.text)}>
          {isIncome ? "+" : "−"}
          {formatCurrency(Number(txn.amount)).replace("₹", "₹ ")}
        </div>
        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          {daysLeft}d left
        </div>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={onRestore}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Restore"
          title="Restore"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={onPurge}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete forever"
          title="Delete forever"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NoteTrashRow({ note, onRestore, onPurge }) {
  const daysLeft = daysUntilPurge(note.deletedAt);

  return (
    <div className="flex items-center gap-3 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
        <StickyNote className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{note.title}</div>
        <div className="truncate text-xs text-muted-foreground">
          {note.plainText || "Empty note"}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="h-2.5 w-2.5" />
        {daysLeft}d left
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={onRestore}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label="Restore"
          title="Restore"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={onPurge}
          className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          aria-label="Delete forever"
          title="Delete forever"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function daysUntilPurge(deletedAt) {
  const elapsed = Date.now() - new Date(deletedAt).getTime();
  const days = Math.max(0, RETENTION_DAYS - Math.floor(elapsed / 864e5));
  return days;
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
    </div>
  );
}