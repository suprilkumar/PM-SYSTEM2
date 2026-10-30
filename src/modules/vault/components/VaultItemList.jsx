"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Lock,
  KeyRound,
  Star,
  Settings,
  ScrollText,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { useVaultItems } from "../hooks/useVaultItems";
import { useVault } from "../context/VaultContext";
import ServiceLogo from "./ServiceLogo";
import CategoryChip from "./CategoryChip";
import SecretReveal from "./SecretReveal";
import VaultAutoLockTimer from "./VaultAutoLockTimer";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, TEMPLATES } from "../templates";
import { cn } from "@/core/utils/cn";

const CATEGORY_TABS = [
  { key: "all", label: "All", color: "#a855f7" },
  ...Object.entries(CATEGORIES)
    .filter(([k]) => k !== "custom")
    .map(([key, cat]) => ({ key, label: cat.label, color: cat.color })),
];

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A→Z" },
  { value: "name-desc", label: "Name Z→A" },
  { value: "created-desc", label: "Recently added" },
  { value: "created-asc", label: "Oldest added" },
  { value: "updated-desc", label: "Recently modified" },
  { value: "updated-asc", label: "Oldest modified" },
  { value: "favorite", label: "Favorites first" },
];

const DISPLAY_KEYS = [
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "login_url", label: "Login URL" },
  { key: "customer_id", label: "Customer ID" },
  { key: "account_number", label: "Account number" },
  { key: "card_name", label: "Card name" },
  { key: "expiry", label: "Expiry" },
  { key: "organization", label: "Organization" },
  { key: "site_name", label: "Site" },
];

export default function VaultItemList() {
  const { items, isLoading, remove, update } = useVaultItems();
  const { lock } = useVault();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("favorite");
  const [view, setView] = useState("list"); // "list" | "card"
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categoryOf = (item) => TEMPLATES[item.kind]?.category ?? "custom";

  const filtered = useMemo(() => {
    let list = items;
    if (activeTab !== "all") {
      list = list.filter((i) => categoryOf(i) === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => {
        if (i.label.toLowerCase().includes(q)) return true;
        const template = TEMPLATES[i.kind];
        if (template?.label.toLowerCase().includes(q)) return true;
        const catLabel = CATEGORIES[template?.category]?.label ?? "";
        if (catLabel.toLowerCase().includes(q)) return true;
        if ((i.payload?.tags ?? []).some((t) => t.toLowerCase().includes(q))) return true;
        return (i.payload?.fields ?? []).some((f) =>
          String(f.value ?? "").toLowerCase().includes(q)
        );
      });
    }
    const sorted = [...list];
    switch (sortBy) {
      case "name-asc":
        sorted.sort((a, b) => a.label.localeCompare(b.label));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.label.localeCompare(a.label));
        break;
      case "created-desc":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "created-asc":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "updated-desc":
        sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case "updated-asc":
        sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        break;
      case "favorite":
      default:
        sorted.sort((a, b) => {
          if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }
    return sorted;
  }, [items, activeTab, search, sortBy]);

  const counts = useMemo(() => {
    const out = { all: items.length };
    for (const i of items) {
      const c = categoryOf(i);
      out[c] = (out[c] ?? 0) + 1;
    }
    return out;
  }, [items]);

  const toggleFavorite = async (item) => {
    await fetch(`/api/vault/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !item.isFavorite }),
    });
    await update(item.id, {});
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await remove(confirmDelete.id);
      toast.success(`"${confirmDelete.label}" deleted`);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const favoriteCount = items.filter((i) => i.isFavorite).length;

  return (
    <div className="mx-auto w-full max-w-[1700px] px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Vault</h1>
            <VaultAutoLockTimer />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} · {favoriteCount} favorite
            {favoriteCount === 1 ? "" : "s"} · encrypted on your device
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/vault/audit">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </Button>
          </Link>
          <Link href="/vault/settings">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => lock()} className="gap-1.5">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Lock</span>
          </Button>
          <Link href="/vault/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New item
            </Button>
          </Link>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = counts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "border-transparent text-white shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
              style={active ? { backgroundColor: tab.color } : {}}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  active ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, template, tags, or field values…"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border bg-background px-2 py-0.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 bg-transparent text-xs outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex rounded-lg border bg-background p-0.5">
          {[
            { v: "list", icon: List },
            { v: "card", icon: LayoutGrid },
          ].map(({ v, icon: Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-md transition",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
              aria-label={v}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          view === "list" ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <EmptyState
            empty={items.length === 0}
            activeTab={activeTab}
          />
        ) : view === "list" ? (
          <div className="space-y-2">
            {filtered.map((item) => (
              <VaultListRow
                key={item.id}
                item={item}
                onToggleFavorite={() => toggleFavorite(item)}
                onDelete={() => setConfirmDelete(item)}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <VaultCard
                key={item.id}
                item={item}
                onToggleFavorite={() => toggleFavorite(item)}
                onDelete={() => setConfirmDelete(item)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${confirmDelete?.label}"?`}
        description="This item will be permanently removed from your vault."
        confirmLabel="Delete item"
      />
    </div>
  );
}

/* ─────────────────────────────────────── */

function VaultListRow({ item, onToggleFavorite, onDelete }) {
  const template = TEMPLATES[item.kind] ?? TEMPLATES.custom;
  const categoryKey = template.category ?? "custom";
  const category = CATEGORIES[categoryKey] ?? CATEGORIES.custom;

  const fields = item.payload?.fields ?? [];

  // Find up to 4 displayable fields
  const displayFields = DISPLAY_KEYS.map((d) => {
    const f = fields.find((x) => x.key === d.key && x.value);
    return f ? { label: d.label, value: f.value } : null;
  }).filter(Boolean).slice(0, 4);

  const passwordField = fields.find(
    (f) => f.sensitive && (f.type === "password" || f.type === "pin")
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:border-primary/40 hover:shadow-[0_4px_20px_-8px_rgba(168,85,247,0.15)]">
      <div
        className="absolute inset-y-3 left-0 w-1 rounded-full"
        style={{ backgroundColor: category.color }}
      />

      <div className="flex items-start gap-3 p-3 pl-4 sm:gap-4">
        <ServiceLogo templateKey={item.kind} size={44} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/vault/items/${item.id}`}
              className="truncate text-sm font-semibold hover:text-primary sm:text-base"
            >
              {item.label}
            </Link>
            {item.isFavorite && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500" />
            )}
            <CategoryChip categoryKey={categoryKey} />
          </div>

          {displayFields.length > 0 ? (
            <div className="mt-1.5 grid grid-cols-1 gap-x-6 gap-y-0.5 sm:grid-cols-2 lg:grid-cols-4">
              {displayFields.map((f) => (
                <div
                  key={f.label}
                  className="flex min-w-0 items-baseline gap-1 text-[11px]"
                >
                  <span className="shrink-0 text-muted-foreground">
                    {f.label}:
                  </span>
                  <span className="truncate text-foreground">{f.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {template.label} · no field data
            </p>
          )}

          <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Created {fmtShortDate(item.createdAt)}</span>
            <span>·</span>
            <span>Modified {fmtShortDate(item.updatedAt)}</span>
          </div>
        </div>

        {/* Password reveal */}
        {passwordField && (
          <div className="hidden md:block">
            <SecretReveal
              value={passwordField.value}
              label={passwordField.label}
              compact
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5 border-l border-border/60 pl-2">
          <button
            onClick={onToggleFavorite}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md transition",
              item.isFavorite
                ? "text-amber-500 hover:bg-amber-500/10"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-label="Favorite"
          >
            <Star className={cn("h-4 w-4", item.isFavorite && "fill-current")} />
          </button>
          <Link
            href={`/vault/items/${item.id}/edit`}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function VaultCard({ item, onToggleFavorite, onDelete }) {
  const template = TEMPLATES[item.kind] ?? TEMPLATES.custom;
  const categoryKey = template.category ?? "custom";
  const category = CATEGORIES[categoryKey] ?? CATEGORIES.custom;

  const fields = item.payload?.fields ?? [];
  const displayFields = DISPLAY_KEYS.map((d) => {
    const f = fields.find((x) => x.key === d.key && x.value);
    return f ? { label: d.label, value: f.value } : null;
  }).filter(Boolean).slice(0, 3);

  const passwordField = fields.find(
    (f) => f.sensitive && (f.type === "password" || f.type === "pin")
  );

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition hover:border-primary/40 hover:shadow-[0_4px_20px_-8px_rgba(168,85,247,0.15)]"
      style={{ borderTopColor: category.color, borderTopWidth: "3px" }}
    >
      <Link href={`/vault/items/${item.id}`} className="block p-4">
        <div className="flex items-start gap-3">
          <ServiceLogo templateKey={item.kind} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{item.label}</span>
              {item.isFavorite && (
                <Star className="h-3 w-3 shrink-0 fill-current text-amber-500" />
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <CategoryChip categoryKey={categoryKey} />
              <span className="truncate text-[10px] text-muted-foreground">
                {template.label}
              </span>
            </div>
          </div>
        </div>

        {displayFields.length > 0 && (
          <div className="mt-3 space-y-1">
            {displayFields.map((f) => (
              <div
                key={f.label}
                className="flex items-baseline gap-1.5 text-[11px]"
              >
                <span className="shrink-0 text-muted-foreground">
                  {f.label}:
                </span>
                <span className="truncate text-foreground">{f.value}</span>
              </div>
            ))}
          </div>
        )}

        {passwordField && (
          <div className="mt-3">
            <SecretReveal
              value={passwordField.value}
              label={passwordField.label}
            />
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
        <span>Modified {fmtShortDate(item.updatedAt)}</span>
        <div className="flex gap-0.5">
          <button
            onClick={onToggleFavorite}
            className={cn(
              "grid h-7 w-7 place-items-center rounded transition",
              item.isFavorite
                ? "text-amber-500 hover:bg-amber-500/10"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", item.isFavorite && "fill-current")} />
          </button>
          <Link
            href={`/vault/items/${item.id}/edit`}
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ empty, activeTab }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
        <KeyRound className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">
        {empty ? "Your vault is empty" : `No ${CATEGORIES[activeTab]?.label ?? ""} items`}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {empty
          ? "Save your first password, card, or key to get started."
          : "Try a different tab, search, or add a new item."}
      </p>
      <Link href="/vault/new" className="mt-4">
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          New item
        </Button>
      </Link>
    </div>
  );
}

function fmtShortDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}