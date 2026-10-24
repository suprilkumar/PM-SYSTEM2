// src/modules/vault/components/TemplatePicker.jsx
"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import ServiceLogo from "./ServiceLogo";
import { TEMPLATES, CATEGORIES } from "../templates";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

export default function TemplatePicker({ value, onChange, onClose, bare = false }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const allTemplates = useMemo(
    () =>
      Object.entries(TEMPLATES)
        .filter(([k]) => k !== "custom")
        .map(([key, t]) => ({ key, ...t })),
    []
  );

  const filtered = useMemo(() => {
    let list = allTemplates;
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.key.toLowerCase().includes(q) ||
          (CATEGORIES[t.category]?.label ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allTemplates, activeCategory, query]);

  const categoryCounts = useMemo(() => {
    const counts = { all: allTemplates.length };
    for (const t of allTemplates) {
      counts[t.category] = (counts[t.category] ?? 0) + 1;
    }
    return counts;
  }, [allTemplates]);

  const Wrapper = bare ? "div" : "div";
  const wrapperClass = bare
    ? ""
    : "rounded-2xl border border-border/70 bg-card overflow-hidden";

  return (
    <div className={wrapperClass}>
      {/* Search */}
      <div className={bare ? "pb-3" : "border-b border-border/60 p-3"}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates — gmail, netflix, aws…"
            className="h-10 pl-9 pr-8"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div
        className={cn(
          "flex gap-1 overflow-x-auto pb-2",
          !bare && "border-b border-border/60 px-2 pt-2"
        )}
      >
        {[
          { key: "all", label: "All" },
          ...Object.entries(CATEGORIES)
            .filter(([k]) => k !== "custom")
            .map(([key, cat]) => ({ key, label: cat.label })),
        ].map((tab) => {
          const active = activeCategory === tab.key;
          const count = categoryCounts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  active ? "bg-white/25" : "bg-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div
        className={cn(
          "overflow-y-auto",
          bare ? "max-h-[320px]" : "max-h-[420px] p-3"
        )}
      >
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {query
              ? `No templates match "${query}"`
              : "No templates in this category"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  onChange(t.key);
                  onClose?.();
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-2 text-left transition",
                  value === t.key
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-accent/30"
                )}
              >
                <ServiceLogo templateKey={t.key} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{t.label}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {CATEGORIES[t.category]?.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom footer */}
      <div className={bare ? "pt-2" : "border-t border-border/60 p-2"}>
        <button
          onClick={() => {
            onChange("custom");
            onClose?.();
          }}
          className="flex w-full items-center justify-between rounded-lg border border-dashed p-2.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <span>+ Create custom template</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}