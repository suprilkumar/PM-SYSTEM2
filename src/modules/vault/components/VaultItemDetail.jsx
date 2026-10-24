"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import { Pencil, Trash2, Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useVaultItems } from "../hooks/useVaultItems";
import { TEMPLATES } from "../templates";
import SecretField from "./SecretField";
import TotpDisplay from "./TotpDisplay";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export default function VaultItemDetail({ id }) {
  const router = useRouter();
  const { items, update, remove } = useVaultItems();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const item = items.find((i) => i.id === id);
  if (!item) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-muted-foreground">Item not found or locked.</p>
        <Link href="/vault">
          <Button variant="outline" size="sm" className="mt-3">
            Back to vault
          </Button>
        </Link>
      </div>
    );
  }

  const template = TEMPLATES[item.kind] ?? TEMPLATES.custom;
  const Icon = Icons[template.icon] ?? Icons.KeyRound;

  const toggleFavorite = async () => {
    await update(item.id, {});
    // Optimistic: leave to server
    // A dedicated endpoint for favorite would be better
    await fetch(`/api/vault/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !item.isFavorite }),
    });
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

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
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
      <div className="flex items-center gap-3">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{
            backgroundColor: template.color + "20",
            color: template.color,
          }}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{item.label}</h1>
          <div className="text-xs text-muted-foreground">
            {template.label} · updated{" "}
            {new Date(item.updatedAt).toLocaleDateString("en-IN")}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4">
        {item.payload?.fields?.map((field) => {
          if (field.type === "totp") {
            return <TotpDisplay key={field.key} secret={field.value} />;
          }
          if (field.sensitive) {
            return (
              <SecretField
                key={field.key}
                label={field.label}
                value={field.value}
                type={field.type}
              />
            );
          }
          if (field.type === "textarea") {
            return (
              <div key={field.key}>
                <div className="text-xs font-medium text-muted-foreground">
                  {field.label}
                </div>
                <pre className="mt-1 whitespace-pre-wrap break-words rounded-lg border bg-muted/30 p-2 text-xs">
                  {field.value}
                </pre>
              </div>
            );
          }
          return (
            <div key={field.key}>
              <div className="text-xs font-medium text-muted-foreground">
                {field.label}
              </div>
              <div className="mt-0.5 break-all rounded-lg border bg-background p-2 font-mono text-sm">
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
        })}
      </div>

      {/* Notes */}
      {item.payload?.notes && (
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="text-xs font-medium text-muted-foreground">Notes</div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{item.payload.notes}</p>
        </div>
      )}

      {/* Tags */}
      {item.payload?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.payload.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${item.label}"?`}
        description="This will move the item to trash. You can restore it for 30 days."
        confirmLabel="Delete"
      />
    </div>
  );
}