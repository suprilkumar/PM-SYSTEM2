// src/modules/notes/components/FolderDialog.jsx
"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FOLDER_COLORS, FOLDER_ICONS } from "../constants";
import { cn } from "@/core/utils/cn";

export default function FolderDialog({ open, onClose, initial, folders, onSaved }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);
  const [icon, setIcon] = useState(FOLDER_ICONS[0]);
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setColor(initial?.color ?? FOLDER_COLORS[0]);
      setIcon(initial?.icon ?? FOLDER_ICONS[0]);
      setParentId(initial?.parentId ?? "");
    }
  }, [open, initial]);

  if (!open) return null;

  const save = async () => {
    if (!name.trim()) return toast.error("Enter a name");
    setSaving(true);
    try {
      const url = initial ? `/api/folders/${initial.id}` : "/api/folders";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color,
          icon,
          parentId: parentId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(initial ? "Folder updated" : "Folder created");
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-md space-y-5 rounded-2xl border border-border/70 bg-popover p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {initial ? "Edit folder" : "New folder"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-accent"
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
            placeholder="e.g. Work, Ideas, Recipes"
            className="mt-1"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
        </div>

        <div>
          <label className="text-xs font-medium">Color</label>
          <div className="mt-2 flex gap-2">
            {FOLDER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full transition",
                  color === c && "ring-2 ring-offset-2 ring-offset-background"
                )}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                aria-label={`Color ${c}`}
              >
                {color === c && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Icon</label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FOLDER_ICONS.map((name) => {
              const Icon = Icons[name] ?? Icons.Folder;
              const active = icon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcon(name)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg border transition",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                  aria-label={`Icon ${name}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium">Parent folder (optional)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">No parent (top-level)</option>
            {folders
              .filter((f) => !initial || f.id !== initial.id)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : initial ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}