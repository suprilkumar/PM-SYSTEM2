"use client";

import { useState } from "react";
import {
  GripVertical,
  X,
  Eye,
  EyeOff,
  Plus,
  Lock,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FIELD_TYPES } from "../templates";
import { cn } from "@/core/utils/cn";

export default function FieldEditor({ fields, onChange }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const update = (index, patch) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const remove = (index) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([
      ...fields,
      {
        key: `field_${Date.now()}`,
        label: "New field",
        type: "text",
        sensitive: false,
        value: "",
      },
    ]);
  };

  const onDragStart = (index) => (e) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (index) => (e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...fields];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(index);
  };

  const onDragEnd = () => setDragIndex(null);

  return (
    <div className="space-y-3">
      {fields.map((field, i) => {
        const isExpanded = expandedIndex === i;
        const isEmpty = !String(field.value ?? "").trim();

        return (
          <div
            key={field.key}
            draggable={!isExpanded}
            onDragStart={onDragStart(i)}
            onDragOver={onDragOver(i)}
            onDragEnd={onDragEnd}
            className={cn(
              "group rounded-xl border bg-background transition",
              field.required && isEmpty
                ? "border-amber-500/40"
                : "border-border/70",
              dragIndex === i && "opacity-50"
            )}
          >
            {/* Header: label + type + actions */}
            <div className="flex items-center gap-2 px-3 py-2">
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50" />

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Input
                  value={field.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Field label"
                  className="h-7 border-0 bg-transparent px-1 text-sm font-medium shadow-none focus-visible:ring-0"
                />
                {field.required && (
                  <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
                    required
                  </span>
                )}
                {field.sensitive && (
                  <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                    <Lock className="h-2.5 w-2.5" />
                    secret
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {isExpanded ? "Done" : "Type"}
              </button>

              <button
                type="button"
                onClick={() => update(i, { sensitive: !field.sensitive })}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-md transition",
                  field.sensitive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
                aria-label={field.sensitive ? "Make visible" : "Make secret"}
                title={field.sensitive ? "Secret (hidden)" : "Visible"}
              >
                {field.sensitive ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove field"
                title="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Expanded: type + key */}
            {isExpanded && (
              <div className="grid gap-2 border-t border-border/60 bg-muted/30 p-3 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => update(i, { type: e.target.value })}
                    className="mt-1 h-8 w-full rounded-md border bg-background px-2 text-xs"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Field key (internal ID)
                  </label>
                  <Input
                    value={field.key}
                    onChange={(e) => update(i, { key: e.target.value })}
                    className="mt-1 h-8 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Value — prominent */}
            <div className="border-t border-border/60 p-3">
              {field.type === "textarea" ? (
                <textarea
                  value={field.value ?? ""}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              ) : field.sensitive ? (
                <SensitiveInput
                  value={field.value ?? ""}
                  onChange={(v) => update(i, { value: v })}
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  type={field.type}
                />
              ) : (
                <Input
                  type={
                    field.type === "email"
                      ? "email"
                      : field.type === "url"
                      ? "url"
                      : field.type === "number"
                      ? "number"
                      : field.type === "date"
                      ? "date"
                      : field.type === "pin"
                      ? "password"
                      : "text"
                  }
                  inputMode={field.type === "pin" ? "numeric" : undefined}
                  value={field.value ?? ""}
                  onChange={(e) => update(i, { value: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}…`}
                  className="h-11 text-sm"
                />
              )}

              {field.required && isEmpty && (
                <p className="mt-1 flex items-center gap-1 text-[10px] text-amber-600">
                  <AlertCircle className="h-2.5 w-2.5" />
                  Required field
                </p>
              )}

              {/* Password strength hint for password fields */}
              {field.type === "password" && field.value && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        field.value.length < 8
                          ? "bg-red-500"
                          : field.value.length < 12
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      )}
                      style={{
                        width: `${Math.min(100, (field.value.length / 20) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {field.value.length < 8
                      ? "Weak"
                      : field.value.length < 12
                      ? "Fair"
                      : "Strong"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="w-full gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add field
      </Button>
    </div>
  );
}

function SensitiveInput({ value, onChange, placeholder, type }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="relative">
      <Input
        type={revealed ? "text" : "password"}
        inputMode={type === "pin" ? "numeric" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pr-10 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
        aria-label={revealed ? "Hide" : "Show"}
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}