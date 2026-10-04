// src/modules/finance/components/TransactionForm.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Save, Wallet, CreditCard, Building2,
  Smartphone, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import CategoryPicker from "./CategoryPicker";
import QuickCategoryDialog from "./QuickCategoryDialog";
import DatePicker from "./DatePicker";
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

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftDateISO(iso, deltaDays) {
  if (!iso) return todayISO();
  const [y, m, d] = iso.split("-").map(Number);
  const next = new Date(y, m - 1, d + deltaDays);
  const yy = next.getFullYear();
  const mm = String(next.getMonth() + 1).padStart(2, "0");
  const dd = String(next.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function isTodayISO(iso) {
  return iso === todayISO();
}

export default function TransactionForm({ initial, onSuccess }) {
  const router = useRouter();
  const { categories, reload: reloadCategories } = useCategories();

  const [type, setType] = useState(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [date, setDate] = useState(
    initial?.date
      ? new Date(initial.date).toISOString().slice(0, 10)
      : todayISO()
  );
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
    // Date stays — user often enters several transactions on the same day.
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
        // pb-40 on mobile reserves room for the sticky action bar
        className="space-y-4 pb-40 md:pb-0"
      >
        {/* Type toggle */}
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
                ? "border-red-500 bg-red-500/10 text-red-600 shadow-sm dark:text-red-400"
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
                ? "border-green-500 bg-green-500/10 text-green-600 shadow-sm dark:text-green-400"
                : "border-border bg-background text-muted-foreground hover:border-green-500/40"
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            Credit
          </button>
        </div>

        {/* Amount */}
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

        {/* Date + Payment */}
        <div className="grid gap-3 sm:grid-cols-2">
         <div>
  <div className="flex items-baseline justify-between">
    <label className="text-xs font-medium">Date</label>
    {!isTodayISO(date) && (
      <button
        type="button"
        onClick={() => setDate(todayISO())}
        className="text-[10px] font-medium text-primary transition hover:underline"
      >
        Jump to today
      </button>
    )}
  </div>

  <div className="mt-1 flex items-stretch gap-1">
    {/* Previous day */}
    <button
      type="button"
      onClick={() => setDate((d) => shiftDateISO(d, -1))}
      className="grid w-10 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground active:scale-95"
      aria-label="Previous day"
      title="Previous day"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>

    <div className="min-w-0 flex-1">
      <DatePicker value={date} onChange={setDate} />
    </div>

    {/* Next day */}
    <button
      type="button"
      onClick={() => setDate((d) => shiftDateISO(d, 1))}
      disabled={isTodayISO(date)}
      className="grid w-10 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background"
      aria-label="Next day"
      title={
        isTodayISO(date) ? "Can't go beyond today" : "Next day"
      }
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
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

        {/* Actions — sticky on mobile with reserved space above it */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 p-3 backdrop-blur md:static md:inset-auto md:z-auto md:border-0 md:bg-transparent md:p-0 md:pt-2 md:backdrop-blur-none">
          <div className="mx-auto flex max-w-3xl flex-col-reverse gap-2 md:flex-row md:justify-end">
            {!isEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={saving || !amountValid || !categoryId}
                onClick={() => submit("saveAndNew")}
                className="md:mr-auto"
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