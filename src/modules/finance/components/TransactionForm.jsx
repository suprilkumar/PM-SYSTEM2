// src/modules/finance/components/TransactionForm.jsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Save,
  Plus,
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  Circle,
} from "lucide-react";
import CategoryPicker from "./CategoryPicker";
import QuickCategoryDialog from "./QuickCategoryDialog";
import { useCategories } from "../hooks/useCategories";
import { PAYMENT_METHODS } from "../constants";
import { invalidateFinanceCache } from "../lib/cache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

const PAYMENT_ICONS = {
  cash: Wallet,
  upi: Smartphone,
  card: CreditCard,
  netbanking: Building2,
  other: Circle,
};

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

  const isEdit = !!initial;
  const amountNum = Number(amount);
  const amountValid = amountNum > 0;

  const reset = () => {
    setAmount("");
    setDescription("");
  };

  const submit = async (mode) => {
    if (!amountValid) return toast.error("Enter a valid amount");
    if (!categoryId) return toast.error("Pick a category");

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/finance/transactions/${initial.id}`
        : "/api/finance/transactions";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          type,
          categoryId,
          date: new Date(date).toISOString(),
          ...(description.trim() ? { description: description.trim() } : {}),
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      await invalidateFinanceCache();
      toast.success(isEdit ? "Transaction updated" : "Transaction added");

      if (mode === "saveAndNew" && !isEdit) {
        reset();
        router.refresh();
      } else {
        onSuccess?.(data);
        router.push("/finance/transactions");
        router.refresh();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit("save");
        }}
        className="space-y-4"
      >
        {/* Big type toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategoryId("");
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
              type === "expense"
                ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-red-500/40"
            )}
          >
            <ArrowDownRight className="h-4 w-4" />
            Debit
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategoryId("");
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
              type === "income"
                ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-green-500/40"
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Credit
          </button>
        </div>

        {/* Amount — hero input */}
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
          </label>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-light text-muted-foreground">₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "");
                setAmount(v);
              }}
              placeholder="0"
              autoFocus
              className="w-full bg-transparent text-4xl font-semibold tracking-tight tabular-nums outline-none placeholder:text-muted-foreground/30"
            />
          </div>
          {amount && !amountValid && (
            <p className="mt-1 text-xs text-destructive">
              Enter a number greater than 0
            </p>
          )}
        </div>

        {/* Category */}
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

        {/* Date + payment side by side */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 h-11"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Payment</label>
            <div className="mt-1 grid grid-cols-5 gap-1">
              {PAYMENT_METHODS.map((m) => {
                const Icon = PAYMENT_ICONS[m.value] ?? Circle;
                const active = paymentMethod === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-lg border py-2 text-[10px] transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                    title={m.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{m.label.slice(0, 4)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Note */}
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-xs font-medium">Note</label>
            <span className="text-[10px] text-muted-foreground">optional</span>
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Lunch at cafe"
            className="mt-1"
          />
        </div>

        {/* Actions — sticky on mobile */}
        <div className="sticky bottom-20 flex flex-col-reverse gap-2 pt-2 md:static md:bottom-auto md:flex-row md:justify-end">
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={saving || !amountValid || !categoryId}
              onClick={() => submit("saveAndNew")}
              className="sm:mr-auto"
            >
              {saving ? "Saving…" : "Save & add another"}
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving || !amountValid || !categoryId}
            size="lg"
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : isEdit ? "Update" : "Save"}
          </Button>
        </div>
      </form>

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