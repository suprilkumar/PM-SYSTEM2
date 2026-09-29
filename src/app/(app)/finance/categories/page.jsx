// src/app/(app)/finance/categories/page.jsx
"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Archive, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/modules/finance/hooks/useCategories";
import CategoryIcon from "@/modules/finance/components/CategoryIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";
import PageHeader from "@/components/layout/PageHeader";

export default function CategoriesPage() {
  const { categories, loading, reload } = useCategories();
  const [tab, setTab] = useState("expense");
  const [addingUnder, setAddingUnder] = useState(null);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { id, name }

  const tops = categories.filter((c) => c.type === tab && !c.parentId && !c.isArchived);
  const childrenOf = (parentId) =>
    categories.filter((c) => c.parentId === parentId && !c.isArchived);

  /* ── create ── */
  const createCategory = async (parentId) => {
    if (!newName.trim()) return;
    const res = await fetch("/api/finance/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        type: tab,
        parentId: parentId === "top" ? null : parentId,
      }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    toast.success("Category added");
    setNewName("");
    setAddingUnder(null);
    reload();
  };

  /* ── update ── */
  const saveEdit = async () => {
    if (!editing?.name?.trim()) return;
    const res = await fetch(`/api/finance/categories/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editing.name.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    toast.success("Renamed");
    setEditing(null);
    reload();
  };

  /* ── archive ── */
  const archiveCategory = async (id) => {
    const res = await fetch(`/api/finance/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error ?? "Failed");
    toast.success("Archived");
    reload();
  };

  /* ── delete ── */
  const deleteCategory = async (id) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    const res = await fetch(`/api/finance/categories/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      // Offer to archive instead if deletion is blocked
      if (/transactions|subcategories/i.test(data.error ?? "")) {
        if (confirm(`${data.error}\n\nArchive it instead?`)) {
          return archiveCategory(id);
        }
        return;
      }
      return toast.error(data.error ?? "Failed");
    }
    toast.success("Deleted");
    reload();
  };

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
        <PageHeader
            title="Categories"
            description="Domains and custom entries"
            breadcrumbs={[
                { label: "Finance", href: "/finance" },
                { label: "Categories" },
            ]}
            actions={
                <Button size="sm" variant="outline" onClick={() => setAddingUnder("top")}>
                <Plus className="mr-1 h-4 w-4" />
                Add domain
                </Button>
            }
        />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Categories</h1>
        <Button size="sm" variant="outline" onClick={() => setAddingUnder("top")}>
          <Plus className="mr-1 h-4 w-4" />
          Add domain
        </Button>
      </div>

      <div className="grid grid-cols-2 rounded-lg border p-1">
        {["expense", "income"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md py-2 text-sm capitalize transition",
              tab === t
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {addingUnder === "top" && (
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New domain name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && createCategory("top")}
          />
          <Button onClick={() => createCategory("top")}>Add</Button>
          <Button variant="outline" onClick={() => setAddingUnder(null)}>Cancel</Button>
        </div>
      )}

      <div className="space-y-3">
        {tops.map((top) => (
          <div key={top.id} className="rounded-xl border bg-card p-3">
            {/* Parent row */}
            <div className="flex items-center gap-2">
              <div
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{
                  backgroundColor: (top.color ?? "#64748b") + "20",
                  color: top.color ?? "#64748b",
                }}
              >
                <CategoryIcon name={top.icon ?? "Circle"} size={16} />
              </div>

              {editing?.id === top.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    autoFocus
                    className="h-8 text-sm"
                  />
                  <button
                    onClick={saveEdit}
                    className="rounded-md p-1.5 text-green-600 hover:bg-accent"
                    aria-label="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{top.name}</div>
                    {!top.isCustom && (
                      <div className="text-xs text-muted-foreground">Pre-built</div>
                    )}
                  </div>

                  <button
                    onClick={() => setAddingUnder(top.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    aria-label="Add subcategory"
                    title="Add subcategory"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditing({ id: top.id, name: top.name })}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    aria-label="Rename"
                    title="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => archiveCategory(top.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                    aria-label="Archive"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCategory(top.id)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Children */}
            {childrenOf(top.id).length > 0 && (
              <div className="ml-3 mt-2 space-y-1 border-l pl-4">
                {childrenOf(top.id).map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/40"
                  >
                    <CategoryIcon name={child.icon ?? "Circle"} size={14} />

                    {editing?.id === child.id ? (
                      <>
                        <Input
                          value={editing.name}
                          onChange={(e) =>
                            setEditing({ ...editing, name: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") setEditing(null);
                          }}
                          autoFocus
                          className="h-8 flex-1 text-sm"
                        />
                        <button
                          onClick={saveEdit}
                          className="rounded-md p-1 text-green-600 hover:bg-accent"
                          aria-label="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                          aria-label="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{child.name}</span>
                        <button
                          onClick={() =>
                            setEditing({ id: child.id, name: child.name })
                          }
                          className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                          aria-label="Rename"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => archiveCategory(child.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                          aria-label="Archive"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(child.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Inline "add child" */}
            {addingUnder === top.id && (
              <div className="mt-2 flex gap-2 border-t pt-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={`New subcategory under ${top.name}`}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && createCategory(top.id)}
                />
                <Button onClick={() => createCategory(top.id)}>Add</Button>
                <Button variant="outline" onClick={() => setAddingUnder(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}