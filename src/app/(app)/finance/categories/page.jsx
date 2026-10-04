// src/app/(app)/finance/categories/page.jsx
"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  FolderTree,
  LayoutGrid,
  List,
  Rows3,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import CategoryIcon from "@/modules/finance/components/CategoryIcon";
import CategoryDialog from "@/modules/finance/components/CategoryDialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import FinanceNav from "@/modules/finance/components/FinanceNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { invalidateFinanceCache } from "@/modules/finance/lib/cache";
import { cn } from "@/core/utils/cn";

const VIEWS = [
  { v: "tree", icon: Rows3, label: "Tree" },
  { v: "cards", icon: LayoutGrid, label: "Cards" },
  { v: "compact", icon: List, label: "Compact" },
];

export default function CategoriesPage() {
  const [showArchived, setShowArchived] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    showArchived
      ? "/api/finance/categories?archived=only"
      : "/api/finance/categories",
    { revalidateOnFocus: false }
  );
  const categories = data?.categories ?? [];

  const [tab, setTab] = useState("expense");
  const [view, setView] = useState("tree");
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [parentFor, setParentFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const filtered = showArchived
      ? categories.filter((c) => c.type === tab)
      : categories.filter((c) => c.type === tab && !c.isArchived);
    if (!search) return filtered;
    const q = search.toLowerCase();
    return filtered.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, tab, search, showArchived]);

  const tops = visible.filter((c) => !c.parentId);
  const childrenOf = (id) => visible.filter((c) => c.parentId === id);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance/categories/${confirmDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Category deleted");
      setConfirmDelete(null);
      mutate();
      invalidateFinanceCache();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async (id) => {
    const res = await fetch(`/api/finance/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    if (res.ok) {
      toast.success("Archived");
      mutate();
      invalidateFinanceCache();
    } else {
      toast.error("Couldn't archive");
    }
  };

  const handleRestore = async (id) => {
    const res = await fetch(`/api/finance/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    });
    if (res.ok) {
      toast.success("Category restored");
      mutate();
      invalidateFinanceCache();
    } else {
      toast.error("Couldn't restore");
    }
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setParentFor(null);
    setDialogOpen(true);
  };

  const openCreate = (parent = null) => {
    setEditing(null);
    setParentFor(parent);
    setDialogOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
      <PageHeader
        title="Categories"
        description="Domains and custom entries for your transactions"
        breadcrumbs={[
          { label: "Finance", href: "/finance" },
          { label: "Categories" },
        ]}
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => openCreate()}>
            <Plus className="h-4 w-4" />
            New category
          </Button>
        }
      />

      <div className="mt-4">
        <FinanceNav />
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border bg-background p-0.5">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition md:px-4 md:py-2 md:text-sm",
                tab === t
                  ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowArchived((s) => !s)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
            showArchived
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
              : "border-border bg-background text-muted-foreground hover:border-primary/40"
          )}
        >
          {showArchived ? (
            <ArchiveRestore className="h-3.5 w-3.5" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
          {showArchived ? "Showing archived" : "Show archived"}
        </button>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories…"
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="ml-auto flex rounded-lg border bg-background p-0.5">
          {VIEWS.map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-md transition",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
              aria-label={label}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : tops.length === 0 ? (
          <EmptyState
            showArchived={showArchived}
            tab={tab}
            onCreate={() => openCreate()}
          />
        ) : view === "tree" ? (
          <TreeView
            tops={tops}
            childrenOf={childrenOf}
            showArchived={showArchived}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            onEdit={openEdit}
            onAddSub={openCreate}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onDelete={setConfirmDelete}
          />
        ) : view === "cards" ? (
          <CardsView
            tops={tops}
            childrenOf={childrenOf}
            showArchived={showArchived}
            onEdit={openEdit}
            onAddSub={openCreate}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onDelete={setConfirmDelete}
          />
        ) : (
          <CompactView
            tops={tops}
            childrenOf={childrenOf}
            showArchived={showArchived}
            onEdit={openEdit}
            onAddSub={openCreate}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onDelete={setConfirmDelete}
          />
        )}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
          setParentFor(null);
        }}
        initial={editing}
        type={tab}
        categories={categories}
        parentFor={parentFor}
        onSaved={async () => {
          await invalidateFinanceCache();
          mutate();
        }}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${confirmDelete?.name}"?`}
        description="This will permanently remove the category. Transactions in it will need to be reassigned."
        confirmLabel="Delete category"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  VIEW 1 — TREE (full-width grouped cards)   */
/* ═══════════════════════════════════════════ */

function TreeView({
  tops,
  childrenOf,
  showArchived,
  collapsed,
  setCollapsed,
  onEdit,
  onAddSub,
  onArchive,
  onRestore,
  onDelete,
}) {
  return (
    <div className="space-y-3">
      {tops.map((cat) => {
        const subs = childrenOf(cat.id);
        const open = collapsed[cat.id] !== true;
        return (
          <div
            key={cat.id}
            className="overflow-hidden rounded-2xl border border-border/70 bg-card"
          >
            {/* Parent header */}
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/20 p-3">
              <button
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [cat.id]: !c[cat.id] }))
                }
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
                aria-label={open ? "Collapse" : "Expand"}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    !open && "-rotate-90"
                  )}
                />
              </button>

              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{
                  backgroundColor: (cat.color ?? "#64748b") + "20",
                  color: cat.color ?? "#64748b",
                }}
              >
                <CategoryIcon name={cat.icon ?? "Circle"} size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{cat.name}</span>
                  {showArchived && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                      Archived
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {subs.length === 0
                    ? "No subcategories"
                    : `${subs.length} subcategor${subs.length === 1 ? "y" : "ies"}`}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {!showArchived && (
                  <>
                    <ActionButton
                      icon={Plus}
                      label="Add subcategory"
                      onClick={() => onAddSub(cat)}
                    />
                    <ActionButton
                      icon={Pencil}
                      label="Edit"
                      onClick={() => onEdit(cat)}
                    />
                    <ActionButton
                      icon={Archive}
                      label="Archive"
                      onClick={() => onArchive(cat.id)}
                    />
                  </>
                )}
                {showArchived && (
                  <ActionButton
                    icon={ArchiveRestore}
                    label="Restore"
                    onClick={() => onRestore(cat.id)}
                  />
                )}
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  onClick={() => onDelete(cat)}
                  danger
                />
              </div>
            </div>

            {/* Subcategory rows */}
            {open && subs.length > 0 && (
              <div className="divide-y divide-border/40">
                {subs.map((sub) => (
                  <SubRow
                    key={sub.id}
                    sub={sub}
                    showArchived={showArchived}
                    onEdit={onEdit}
                    onArchive={onArchive}
                    onRestore={onRestore}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}

            {open && subs.length === 0 && !showArchived && (
              <button
                onClick={() => onAddSub(cat)}
                className="flex w-full items-center justify-center gap-1.5 p-3 text-xs text-muted-foreground transition hover:bg-accent/40 hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add first subcategory
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubRow({ sub, showArchived, onEdit, onArchive, onRestore, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-2 pl-6 pr-3 transition-colors hover:bg-accent/30">
      <div className="flex items-center gap-3">
        <div
          className="h-7 w-0.5 rounded-full"
          style={{ backgroundColor: (sub.color ?? "#64748b") + "60" }}
        />
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: (sub.color ?? "#64748b") + "20",
            color: sub.color ?? "#64748b",
          }}
        >
          <CategoryIcon name={sub.icon ?? "Circle"} size={14} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{sub.name}</div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {!showArchived && (
          <>
            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={() => onEdit(sub)}
            />
            <ActionButton
              icon={Archive}
              label="Archive"
              onClick={() => onArchive(sub.id)}
            />
          </>
        )}
        {showArchived && (
          <ActionButton
            icon={ArchiveRestore}
            label="Restore"
            onClick={() => onRestore(sub.id)}
          />
        )}
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={() => onDelete(sub)}
          danger
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
/*  VIEW 2 — CARDS (compact grid, no scroll)   */
/* ═══════════════════════════════════════════ */

function CardsView({
  tops,
  childrenOf,
  showArchived,
  onEdit,
  onAddSub,
  onArchive,
  onRestore,
  onDelete,
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {tops.map((cat) => (
        <CategoryCard
          key={cat.id}
          category={cat}
          subcategories={childrenOf(cat.id)}
          showArchived={showArchived}
          onEdit={onEdit}
          onAddSub={() => onAddSub(cat)}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function CategoryCard({
  category,
  subcategories,
  showArchived,
  onEdit,
  onAddSub,
  onArchive,
  onRestore,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const subCount = subcategories.length;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      {/* Header */}
      <div className="flex items-start gap-3 p-3 pb-2">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            backgroundColor: (category.color ?? "#64748b") + "20",
            color: category.color ?? "#64748b",
          }}
        >
          <CategoryIcon name={category.icon ?? "Circle"} size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {category.name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {subCount === 0
              ? "No subcategories"
              : `${subCount} subcategor${subCount === 1 ? "y" : "ies"}`}
          </div>
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
            aria-label="Category actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-border/70 bg-popover shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {!showArchived && (
                <>
                  <MenuItem
                    icon={Plus}
                    label="Add subcategory"
                    onClick={() => {
                      setMenuOpen(false);
                      onAddSub();
                    }}
                  />
                  <MenuItem
                    icon={Pencil}
                    label="Edit"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(category);
                    }}
                  />
                  <MenuItem
                    icon={Archive}
                    label="Archive"
                    onClick={() => {
                      setMenuOpen(false);
                      onArchive(category.id);
                    }}
                  />
                </>
              )}
              {showArchived && (
                <MenuItem
                  icon={ArchiveRestore}
                  label="Restore"
                  onClick={() => {
                    setMenuOpen(false);
                    onRestore(category.id);
                  }}
                />
              )}
              <MenuItem
                icon={Trash2}
                label="Delete"
                danger
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(category);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Subcategories — compact chips with actions on hover */}
      <div className="flex-1 px-3 pb-3">
        {subCount === 0 ? (
          !showArchived && (
            <button
              onClick={onAddSub}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <Plus className="h-3 w-3" />
              Add subcategory
            </button>
          )
        ) : (
          <ul className="space-y-0.5">
            {subcategories.map((sub) => (
              <SubChip
                key={sub.id}
                sub={sub}
                showArchived={showArchived}
                onEdit={onEdit}
                onArchive={onArchive}
                onRestore={onRestore}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SubChip({ sub, showArchived, onEdit, onArchive, onRestore, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <li className="group/sub relative flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-accent/50">
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded"
        style={{
          backgroundColor: (sub.color ?? "#64748b") + "20",
          color: sub.color ?? "#64748b",
        }}
      >
        <CategoryIcon name={sub.icon ?? "Circle"} size={12} />
      </span>

      <span className="min-w-0 flex-1 truncate text-xs">{sub.name}</span>

      {/* Actions - fade in on row hover */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover/sub:opacity-100">
        {!showArchived && (
          <>
            <MiniButton
              icon={Pencil}
              label="Edit"
              onClick={() => onEdit(sub)}
            />
            <MiniButton
              icon={Archive}
              label="Archive"
              onClick={() => onArchive(sub.id)}
            />
          </>
        )}
        {showArchived && (
          <MiniButton
            icon={ArchiveRestore}
            label="Restore"
            onClick={() => onRestore(sub.id)}
          />
        )}
        <MiniButton
          icon={Trash2}
          label="Delete"
          onClick={() => onDelete(sub)}
          danger
        />
      </div>
    </li>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════ */
/*  VIEW 3 — COMPACT (dense list)              */
/* ═══════════════════════════════════════════ */

function CompactView({
  tops,
  childrenOf,
  showArchived,
  onEdit,
  onAddSub,
  onArchive,
  onRestore,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      {tops.map((cat) => (
        <div key={cat.id} className="border-b border-border/40 last:border-b-0">
          <CompactRow
            category={cat}
            isParent
            showArchived={showArchived}
            onEdit={onEdit}
            onAddSub={() => onAddSub(cat)}
            onArchive={onArchive}
            onRestore={onRestore}
            onDelete={onDelete}
          />
          {childrenOf(cat.id).map((child) => (
            <CompactRow
              key={child.id}
              category={child}
              isChild
              showArchived={showArchived}
              onEdit={onEdit}
              onArchive={onArchive}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function CompactRow({
  category,
  isParent = false,
  isChild = false,
  showArchived,
  onEdit,
  onAddSub,
  onArchive,
  onRestore,
  onDelete,
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 transition-colors hover:bg-accent/30",
        isParent && "bg-muted/20 py-2.5",
        isChild && "py-2 pl-8"
      )}
    >
      {isChild && (
        <div
          className="h-6 w-0.5 rounded-full"
          style={{ backgroundColor: (category.color ?? "#64748b") + "60" }}
        />
      )}

      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg",
          isParent ? "h-8 w-8" : "h-7 w-7"
        )}
        style={{
          backgroundColor: (category.color ?? "#64748b") + "20",
          color: category.color ?? "#64748b",
        }}
      >
        <CategoryIcon
          name={category.icon ?? "Circle"}
          size={isParent ? 15 : 13}
        />
      </span>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate",
            isParent ? "text-sm font-semibold" : "text-sm"
          )}
        >
          {category.name}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {!showArchived && (
          <>
            {isParent && (
              <ActionButton
                icon={Plus}
                label="Add sub"
                onClick={onAddSub}
              />
            )}
            <ActionButton
              icon={Pencil}
              label="Edit"
              onClick={() => onEdit(category)}
            />
            <ActionButton
              icon={Archive}
              label="Archive"
              onClick={() => onArchive(category.id)}
            />
          </>
        )}
        {showArchived && (
          <ActionButton
            icon={ArchiveRestore}
            label="Restore"
            onClick={() => onRestore(category.id)}
          />
        )}
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={() => onDelete(category)}
          danger
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────── */
/* Buttons                                      */
/* ──────────────────────────────────────────── */

function ActionButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition",
        danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-accent hover:text-foreground"
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function MiniButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid h-6 w-6 place-items-center rounded text-muted-foreground transition",
        danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-accent hover:text-foreground"
      )}
      aria-label={label}
      title={label}
    >
      <Icon className="h-3 w-3" />
    </button>
  );
}

/* ──────────────────────────────────────────── */
/* Empty                                         */
/* ──────────────────────────────────────────── */

function EmptyState({ showArchived, tab, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
        <FolderTree className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">
        {showArchived
          ? `No archived ${tab} categories`
          : `No ${tab} categories`}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {showArchived
          ? "Categories you archive will appear here."
          : "Create one to start organizing transactions."}
      </p>
      {!showArchived && (
        <Button className="mt-4 gap-1.5" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New category
        </Button>
      )}
    </div>
  );
}