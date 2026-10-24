// src/modules/vault/components/VaultItemEditor.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Tag, FileText, AlertCircle } from "lucide-react";
import { useVaultItems } from "../hooks/useVaultItems";
import { TEMPLATES, CATEGORIES } from "../templates";
import FieldEditor from "./FieldEditor";
import ServiceLogo from "./ServiceLogo";
import CategoryChip from "./CategoryChip";
import TemplatePicker from "./TemplatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

export default function VaultItemEditor({ initial }) {
  const router = useRouter();
  const { create, update } = useVaultItems();

  const initialTemplate = initial?.kind ?? "gmail";
  const [kind, setKind] = useState(initialTemplate);
  const [label, setLabel] = useState(initial?.label ?? "");
  const [fields, setFields] = useState(
    initial?.payload?.fields ??
      TEMPLATES[initialTemplate].fields.map((f) => ({ ...f, value: "" }))
  );
  const [notes, setNotes] = useState(initial?.payload?.notes ?? "");
  const [tags, setTags] = useState((initial?.payload?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(!initial);

  const isEdit = !!initial;
  const template = TEMPLATES[kind];
  const category = CATEGORIES[template.category] ?? CATEGORIES.custom;

  const pickTemplate = (key) => {
    setKind(key);
    if (!isEdit) {
      setFields(TEMPLATES[key].fields.map((f) => ({ ...f, value: "" })));
    }
    setShowTemplatePicker(false);
  };

  const save = async () => {
    if (!label.trim()) return toast.error("Give this item a name");
    const filled = fields.filter((f) => String(f.value ?? "").trim() !== "");
    if (filled.length === 0) return toast.error("Add at least one field");

    const missing = fields.filter(
      (f) => f.required && String(f.value ?? "").trim() === ""
    );
    if (missing.length > 0) {
      return toast.error(`Required: ${missing.map((f) => f.label).join(", ")}`);
    }

    setSaving(true);
    try {
      const payload = {
        title: label,
        template: kind,
        fields: filled,
        notes: notes || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        custom: kind === "custom",
      };

      if (isEdit) {
        await update(initial.id, { label, payload });
        toast.success("Item updated");
      } else {
        await create({ kind, label, payload });
        toast.success("Item saved");
      }
      router.push("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filledCount = fields.filter((f) => f.value).length;
  const requiredCount = fields.filter((f) => f.required).length;

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 py-6 md:px-6 md:py-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <ServiceLogo templateKey={kind} size={48} />
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {isEdit ? "Edit item" : "New item"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <CategoryChip categoryKey={template.category} />
              <span className="text-xs text-muted-foreground">
                {template.label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update item" : "Save item"}
          </Button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        {/* ══ Main column ══ */}
        <div className="min-w-0 space-y-5">
          {/* Template — flat, not nested */}
          {!isEdit && (
            <div className="rounded-2xl border border-border/70 bg-card">
              <button
                onClick={() => setShowTemplatePicker((s) => !s)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <ServiceLogo templateKey={kind} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Template
                  </div>
                  <div className="truncate text-sm font-medium">
                    {template.label}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    showTemplatePicker && "rotate-180"
                  )}
                />
              </button>

              {showTemplatePicker && (
                <div className="border-t border-border/60 p-3">
                  {/* TemplatePicker without its own outer card border */}
                  <TemplatePicker
                    value={kind}
                    onChange={pickTemplate}
                    onClose={() => setShowTemplatePicker(false)}
                    bare
                  />
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Name
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={`e.g. ${template.label} — personal`}
              className="mt-2 h-11 text-base font-medium"
              autoFocus={isEdit}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              A short name you'll recognize. You can add multiple accounts of
              the same type.
            </p>
          </div>

          {/* Fields */}
          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fields
                </label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {filledCount} filled · {requiredCount} required
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Drag to reorder
              </span>
            </div>
            <FieldEditor fields={fields} onChange={setFields} />
          </div>

          {/* Tags */}
          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Tag className="h-3 w-3" />
              Tags
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="personal, work, important"
              className="mt-2"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Comma-separated. Used for filtering and search.
            </p>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="h-3 w-3" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recovery codes, security questions, any context…"
              rows={3}
              className="mt-2 w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* ══ Right sidebar ══ */}
        <aside className="space-y-3 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-magenta-500/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <AlertCircle className="h-4 w-4" />
              Security note
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Everything here is encrypted on this device before being sent to
              the server. We cannot read your passwords, even if compelled.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              You can save multiple accounts of the same type — just give each a
              distinct name.
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What you're saving
            </div>
            <div className="mt-2 space-y-1.5">
              {fields.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Add fields to see the summary.
                </p>
              ) : (
                fields.slice(0, 10).map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate text-muted-foreground">
                      {f.label}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        f.value
                          ? "bg-emerald-500/15 text-emerald-600"
                          : f.required
                          ? "bg-red-500/15 text-red-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {f.value ? "set" : f.required ? "required" : "optional"}
                    </span>
                  </div>
                ))
              )}
              {fields.length > 10 && (
                <p className="pt-1 text-[10px] text-muted-foreground">
                  +{fields.length - 10} more
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}