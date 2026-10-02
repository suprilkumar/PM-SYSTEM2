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
  FolderTree,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
import CategoryIcon from "@/modules/finance/components/CategoryIcon";
import CategoryDialog from "@/modules/finance/components/CategoryDialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { invalidateFinanceCache } from "@/modules/finance/lib/cache";
import { cn } from "@/core/utils/cn";
import FinanceNav from "@/modules/finance/components/FinanceNav";

export default function CategoriesPage() {
  const { data, isLoading, mutate } = useSWR("/api/finance/categories");
  const categories = data?.categories ?? [];

  const [tab, setTab] = useState("expense");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [parentFor, setParentFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const filtered = categories.filter((c) => c.type === tab && !c.isArchived);
    if (!search) return filtered;
    const q = search.toLowerCase();
    return filtered.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, tab, search]);

  const tops = visible.filter((c) => !c.parentId);
  const childrenOf = (id) =>
    visible.filter((c) => c.parentId === id);

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
    } else {
      toast.error("Couldn't archive");
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Categories"
        description="Domains and custom entries for your transactions"
        breadcrumbs={[
          { label: "Finance", href: "/finance" },
          { label: "Categories" },
        ]}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setParentFor(null);
              setDialogOpen(true);
            }}
          >
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
          {[
            { v: "grid", icon: LayoutGrid, label: "Grid" },
            { v: "list", icon: List, label: "List" },
          ].map(({ v, icon: Icon, label }) => (
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
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : tops.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold">No {tab} categories</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create one to start organizing transactions.
            </p>
            <Button
              className="mt-4 gap-1.5"
              onClick={() => {
                setEditing(null);
                setParentFor(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New category
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tops.map((cat) => (
              <CategoryGridCard
                key={cat.id}
                category={cat}
                children={childrenOf(cat.id)}
                onEdit={() => {
                  setEditing(cat);
                  setParentFor(null);
                  setDialogOpen(true);
                }}
                onAddSub={() => {
                  setEditing(null);
                  setParentFor(cat);
                  setDialogOpen(true);
                }}
                onArchive={() => handleArchive(cat.id)}
                onDelete={() => setConfirmDelete(cat)}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
            {tops.map((cat) => (
              <CategoryListRow
                key={cat.id}
                category={cat}
                children={childrenOf(cat.id)}
                onEdit={() => {
                  setEditing(cat);
                  setParentFor(null);
                  setDialogOpen(true);
                }}
                onAddSub={() => {
                  setEditing(null);
                  setParentFor(cat);
                  setDialogOpen(true);
                }}
                onArchive={() => handleArchive(cat.id)}
                onDelete={() => setConfirmDelete(cat)}
              />
            ))}
          </div>
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
        description="This will permanently remove the category. Any transactions in it will need to be reassigned."
        confirmLabel="Delete category"
      />
    </div>
  );
}

function CategoryGridCard({
  category,
  children,
  onEdit,
  onAddSub,
  onArchive,
  onDelete,
}) {
  const Icon = CategoryIcon;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
            style={{
              backgroundColor: (category.color ?? "#64748b") + "20",
              color: category.color ?? "#64748b",
            }}
          >
            <Icon name={category.icon ?? "Circle"} size={20} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{category.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {children.length > 0
                ? `${children.length} subcategor${children.length === 1 ? "y" : "ies"}`
                : "Top-level"}
            </div>
          </div>

          <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
            <IconButton
              onClick={onAddSub}
              label="Add subcategory"
              icon={Plus}
            />
            <IconButton onClick={onEdit} label="Edit" icon={Pencil} />
            <IconButton
              onClick={onArchive}
              label="Archive"
              icon={Archive}
            />
            <IconButton
              onClick={onDelete}
              label="Delete"
              icon={Trash2}
              danger
            />
          </div>
        </div>

        {children.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {children.slice(0, 6).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: c.color ?? "#64748b" }}
                />
                {c.name}
              </span>
            ))}
            {children.length > 6 && (
              <span className="text-[11px] text-muted-foreground">
                +{children.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryListRow({
  category,
  children,
  onEdit,
  onAddSub,
  onArchive,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 p-3 last:border-0 hover:bg-accent/40">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: (category.color ?? "#64748b") + "20",
          color: category.color ?? "#64748b",
        }}
      >
        <CategoryIcon name={category.icon ?? "Circle"} size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{category.name}</div>
        {children.length > 0 && (
          <div className="truncate text-xs text-muted-foreground">
            {children.map((c) => c.name).join(" · ")}
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-1">
        <IconButton onClick={onAddSub} label="Add sub" icon={Plus} />
        <IconButton onClick={onEdit} label="Edit" icon={Pencil} />
        <IconButton onClick={onArchive} label="Archive" icon={Archive} />
        <IconButton onClick={onDelete} label="Delete" icon={Trash2} danger />
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition",
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