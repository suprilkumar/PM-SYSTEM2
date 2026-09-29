// src/modules/finance/components/QuickCategoryDialog.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

export default function QuickCategoryDialog({
  open,
  onClose,
  type,
  categories,
  onCreated,
}) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(""); // "" = top-level
  const [saving, setSaving] = useState(false);

  // Top-level categories of the current type
  const tops = useMemo(
    () =>
      categories.filter(
        (c) => c.type === type && !c.parentId && !c.isArchived
      ),
    [categories, type]
  );

  useEffect(() => {
    if (!open) {
      setName("");
      setParentId("");
    }
  }, [open]);

  if (!open) return null;

  const create = async () => {
    if (!name.trim()) return toast.error("Enter a name");

    setSaving(true);
    try {
      const res = await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          parentId: parentId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      toast.success("Category created");
      onCreated?.(data.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm space-y-4 rounded-xl border bg-popover p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">New {type} category</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="text-xs font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Airtel Postpaid"
            className="mt-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
            }}
          />
        </div>

        <div>
          <label className="text-xs font-medium">Parent (optional)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Top-level (new domain)</option>
            {tops.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick a parent to make this a subcategory.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={create} disabled={saving}>
            {saving ? "Creating…" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}