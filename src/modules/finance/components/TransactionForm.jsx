// src/modules/finance/components/TransactionForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CategoryPicker from "./CategoryPicker";
import QuickCategoryDialog from "./QuickCategoryDialog";
import { useCategories } from "../hooks/useCategories";
import { PAYMENT_METHODS } from "../constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

function toDateInput(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TransactionForm({ initial, onSuccess }) {
  const router = useRouter();
  const { categories, reload: reloadCategories } = useCategories();

  const [type, setType] = useState(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [date, setDate] = useState(toDateInput(initial?.date ?? new Date()));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [paymentMethod, setPaymentMethod] = useState(
    initial?.paymentMethod ?? "upi"
  );
  const [saving, setSaving] = useState(false);
  const [showQuickCategory, setShowQuickCategory] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (!categoryId) return toast.error("Pick a category");

    setSaving(true);
    try {
      const url = initial
        ? `/api/finance/transactions/${initial.id}`
        : "/api/finance/transactions";
      const method = initial ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          categoryId,
          date: new Date(date).toISOString(),
          description: description || null,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      toast.success(initial ? "Transaction updated" : "Transaction added");
      onSuccess?.(data);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 rounded-lg border p-1">
          {["expense", "income"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={cn(
                "rounded-md py-2 text-sm font-medium capitalize transition",
                type === t
                  ? t === "income"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium">Amount</label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 h-12 text-lg font-semibold"
            autoFocus
          />
        </div>

        {/* Category — the fixed picker */}
        <div>
          <label className="text-xs font-medium">Category</label>
          <div className="mt-1">
            <CategoryPicker
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              type={type}
              onCreateRequest={() => setShowQuickCategory(true)}
            />
          </div>
        </div>

        {/* Date + Payment */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Payment</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium">Note (optional)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Lunch at cafe"
            className="mt-1"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "Saving…" : initial ? "Update" : "Add"}
          </Button>
        </div>
      </form>

      {/* Quick create — new modal */}
      <QuickCategoryDialog
        open={showQuickCategory}
        onClose={() => setShowQuickCategory(false)}
        type={type}
        categories={categories}
        onCreated={(newId) => {
          reloadCategories().then(() => {
            setCategoryId(newId);
            setShowQuickCategory(false);
          });
        }}
      />
    </>
  );
}