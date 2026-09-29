// src/modules/finance/components/CategoryPicker.jsx
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Search, ChevronDown, Check, Plus } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

/**
 * Searchable category selector.
 *
 * Props:
 *   categories: Category[]           — full user category list
 *   value: string | null             — selected category id
 *   onChange: (id: string) => void   — called with chosen category id
 *   type: "income" | "expense"
 *   onCreateRequest?: () => void     — optional: open "add category" flow
 */
export default function CategoryPicker({
  categories,
  value,
  onChange,
  type,
  onCreateRequest,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Build flat list of LEAF categories only (things you can transact under).
  // If a top-level has no children, it's itself a leaf.
  const leaves = useMemo(() => {
    const ofType = categories.filter(
      (c) => c.type === type && !c.isArchived
    );
    const byId = new Map(ofType.map((c) => [c.id, c]));
    return ofType
      .filter((c) => !c.parentId || !ofType.some((x) => x.parentId === c.id))
      .map((c) => ({
        ...c,
        parent: c.parentId ? byId.get(c.parentId) : null,
      }));
  }, [categories, type]);

  const selected = useMemo(
    () => leaves.find((c) => c.id === value) ?? null,
    [leaves, value]
  );

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leaves;
    return leaves.filter((c) => {
      const name = c.name.toLowerCase();
      const parent = c.parent?.name?.toLowerCase() ?? "";
      return name.includes(q) || parent.includes(q);
    });
  }, [leaves, search]);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      // Delay a tick so the element mounts before focus
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setSearch("");
    }
  }, [open]);

  const pick = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm transition",
          open ? "ring-2 ring-primary/30" : "hover:bg-accent/40"
        )}
      >
        {selected ? (
          <>
            <span
              className="grid h-6 w-6 shrink-0 place-items-center rounded"
              style={{
                backgroundColor: (selected.color ?? "#64748b") + "20",
                color: selected.color ?? "#64748b",
              }}
            >
              <CategoryIcon name={selected.icon ?? "Circle"} size={13} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              {selected.parent && (
                <span className="text-muted-foreground">
                  {selected.parent.name} /{" "}
                </span>
              )}
              <span className="font-medium">{selected.name}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-muted-foreground">
            Select a category…
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-lg border bg-popover shadow-lg">
          {/* Search */}
          <div className="relative border-b p-2">
            <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="h-9 pl-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length > 0) {
                  e.preventDefault();
                  pick(filtered[0].id);
                }
                if (e.key === "Escape") setOpen(false);
              }}
            />
          </div>

          {/* List */}
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No categories match "{search}"
                {onCreateRequest && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onCreateRequest();
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-1 text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add new category
                  </button>
                )}
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c.id)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                    c.id === value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  )}
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center rounded"
                    style={{
                      backgroundColor: (c.color ?? "#64748b") + "20",
                      color: c.color ?? "#64748b",
                    }}
                  >
                    <CategoryIcon name={c.icon ?? "Circle"} size={13} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {c.parent && (
                      <span className="text-xs text-muted-foreground">
                        {c.parent.name} /{" "}
                      </span>
                    )}
                    <span>{c.name}</span>
                  </span>
                  {c.id === value && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {onCreateRequest && filtered.length > 0 && (
            <div className="border-t p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreateRequest();
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-primary hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Add new category
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}