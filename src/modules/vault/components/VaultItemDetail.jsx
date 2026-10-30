"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  Copy,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useVaultItems } from "../hooks/useVaultItems";
import ServiceLogo from "./ServiceLogo";
import CategoryChip from "./CategoryChip";
import TotpDisplay from "./TotpDisplay";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TEMPLATES, CATEGORIES } from "../templates";
import { cn } from "@/core/utils/cn";

export default function VaultItemDetail({ id }) {
  const router = useRouter();
  const { items, isLoading, update, remove } = useVaultItems();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const item = items.find((i) => i.id === id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-4 md:p-8">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-muted-foreground">
          Item not found or vault locked.
        </p>
        <Link href="/vault">
          <Button variant="outline" size="sm" className="mt-3">
            Back to vault
          </Button>
        </Link>
      </div>
    );
  }

  const template = TEMPLATES[item.kind] ?? TEMPLATES.custom;
  const category = CATEGORIES[template.category] ?? CATEGORIES.custom;

  const toggleFavorite = async () => {
    await fetch(`/api/vault/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !item.isFavorite }),
    });
    await update(item.id, {});
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(item.id);
      toast.success("Item deleted");
      router.push("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const fields = item.payload?.fields ?? [];
  const notes = item.payload?.notes;
  const tags = item.payload?.tags ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6 md:p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/vault")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Vault
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFavorite}
            className="gap-1.5"
          >
            <Star
              className={cn("h-4 w-4", item.isFavorite && "fill-current text-amber-500")}
            />
            {item.isFavorite ? "Favorited" : "Favorite"}
          </Button>
          <Link href={`/vault/items/${item.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="flex items-start gap-4">
          <ServiceLogo templateKey={item.kind} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{item.label}</h1>
              {item.isFavorite && (
                <Star className="h-4 w-4 fill-current text-amber-500" />
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <CategoryChip categoryKey={template.category} size="md" />
              <span className="text-sm text-muted-foreground">{template.label}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 text-xs sm:grid-cols-4">
          <div>
            <div className="text-muted-foreground">Created</div>
            <div className="font-medium">
              {new Date(item.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Last modified</div>
            <div className="font-medium">
              {new Date(item.updatedAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Fields</div>
            <div className="font-medium">{fields.length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Category</div>
            <div className="font-medium">{category.label}</div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Details
        </div>
        <div className="divide-y divide-border/50">
          {fields.map((field) => (
            <FieldRow key={field.key} field={field} />
          ))}
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tags
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{notes}</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${item.label}"?`}
        description="This will permanently remove the item from your vault."
        confirmLabel="Delete"
      />
    </div>
  );
}

function FieldRow({ field }) {
  if (field.type === "totp") {
    return (
      <div className="py-2.5">
        <TotpDisplay secret={field.value} />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="py-2.5">
        <div className="text-xs text-muted-foreground">{field.label}</div>
        <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/30 p-3 text-xs">
          {field.value}
        </pre>
      </div>
    );
  }

  if (field.sensitive) {
    return (
      <div className="py-2.5">
        <SensitiveValue label={field.label} value={field.value} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-3 py-2.5">
      <div className="text-xs text-muted-foreground">{field.label}</div>
      <div className="min-w-0 break-words font-mono text-sm">
        {field.type === "url" ? (
          <a
            href={field.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {field.value}
          </a>
        ) : (
          field.value
        )}
      </div>
    </div>
  );
}

function SensitiveValue({ label, value }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied`, {
      description: "Clipboard clears in 30 seconds",
    });
    setTimeout(() => setCopied(false), 1500);
    setTimeout(async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === value) await navigator.clipboard.writeText("");
      } catch {}
    }, 30_000);
  };

  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "min-w-0 flex-1 break-all rounded-md border bg-muted/30 px-2 py-1 font-mono text-sm",
            !revealed && "tracking-wider text-muted-foreground"
          )}
        >
          {revealed ? value : "•".repeat(Math.min(20, value.length))}
        </span>
        <button
          onClick={() => setRevealed((r) => !r)}
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent"
          aria-label={revealed ? "Hide" : "Reveal"}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={copy}
          className={cn(
            "grid h-7 w-7 place-items-center rounded transition",
            copied
              ? "bg-emerald-500/15 text-emerald-600"
              : "text-muted-foreground hover:bg-accent"
          )}
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}