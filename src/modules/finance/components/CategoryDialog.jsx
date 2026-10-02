// src/modules/finance/components/CategoryDialog.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Check, Search, Plus } from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "../constants";
import { cn } from "@/core/utils/cn";

export default function CategoryDialog({
  open,
  onClose,
  initial,
  type = "expense",
  categories = [],
  parentFor = null,
  onSaved,
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [parentId, setParentId] = useState("");
  const [iconQuery, setIconQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setColor(initial?.color ?? CATEGORY_COLORS[0]);
    setIcon(initial?.icon ?? CATEGORY_ICONS[0]);
    setParentId(initial?.parentId ?? parentFor?.id ?? "");
    setIconQuery("");
  }, [open, initial, parentFor]);

  const parents = useMemo(
    () =>
      categories.filter(
        (c) => c.type === type && !c.parentId && !c.isArchived && c.id !== initial?.id
      ),
    [categories, type, initial]
  );

  const filteredIcons = useMemo(() => {
    if (!iconQuery) return CATEGORY_ICONS;
    const q = iconQuery.toLowerCase();
    return CATEGORY_ICONS.filter((n) => n.toLowerCase().includes(q));
  }, [iconQuery]);

  if (!open) return null;

  const save = async () => {
    if (!name.trim()) return toast.error("Enter a name");
    setSaving(true);
    try {
      const url = initial
        ? `/api/finance/categories/${initial.id}`
        : "/api/finance/categories";
      const method = initial ? "PATCH" : "POST";

      const body = {
        name: name.trim(),
        color,
        icon,
        parentId: parentId || null,
      };
      // Create-only: type is required
      if (!initial) body.type = type;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(initial ? "Category updated" : "Category created");
      onSaved?.(data);
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
        className="animate-scale-in flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold">
              {initial ? "Edit category" : "New category"}
            </h3>
            <p className="text-xs text-muted-foreground capitalize">
              {type} · {parentFor ? `under ${parentFor.name}` : parentId ? "subcategory" : "top-level"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body — scrollable on small screens */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {/* Live preview + name */}
          <div className="flex items-center gap-3">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
              style={{
                backgroundColor: color + "20",
                color,
              }}
            >
              {(() => {
                const Icon = Icons[icon] ?? Icons.Circle;
                return <Icon className="h-6 w-6" />;
              })()}
            </span>
            <div className="flex-1">
              <label className="text-xs font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Airtel Postpaid, Coffee, Gym"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && save()}
                className="mt-1"
              />
            </div>
          </div>

          {/* Parent */}
          <div>
            <label className="text-xs font-medium">Parent (optional)</label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Top-level (new domain)</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div>
            <label className="text-xs font-medium">Color</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full transition",
                    color === c
                      ? "ring-2 ring-offset-2 ring-offset-popover"
                      : "hover:scale-105"
                  )}
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px ${c}` : undefined,
                  }}
                  aria-label={`Color ${c}`}
                >
                  {color === c && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icons */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Icon</label>
              <span className="text-[10px] text-muted-foreground">
                {filteredIcons.length} icons
              </span>
            </div>

            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={iconQuery}
                onChange={(e) => setIconQuery(e.target.value)}
                placeholder="Search icons…"
                className="h-9 pl-8 text-xs"
              />
            </div>

            <div className="mt-3 grid max-h-[220px] grid-cols-8 gap-1.5 overflow-y-auto rounded-lg border p-2 sm:grid-cols-10 md:grid-cols-12">
              {filteredIcons.map((iconName) => {
                const Icon = Icons[iconName] ?? Icons.Circle;
                const active = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "grid aspect-square place-items-center rounded-lg border transition",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    title={iconName}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border/60 px-5 py-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? "Saving…" : initial ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}