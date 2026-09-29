// src/app/(app)/finance/transactions/[id]/edit/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import TransactionForm from "@/modules/finance/components/TransactionForm";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";

export default function EditTransactionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/finance/transactions/${id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (!cancelled) setTxn(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this transaction?")) return;
    const res = await fetch(`/api/finance/transactions/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Transaction deleted");
      router.push("/finance/transactions");
      router.refresh();
    } else {
      toast.error("Could not delete");
    }
  };

  
const handleDuplicate = async () => {
  if (!txn) return;
  const res = await fetch("/api/finance/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(txn.amount),
      type: txn.type,
      categoryId: txn.categoryId,
      date: new Date().toISOString(),
      description: txn.description,
      paymentMethod: txn.paymentMethod,
    }),
  });
  if (res.ok) {
    toast.success("Duplicated");
    router.push("/finance/transactions");
    router.refresh();
  } else {
    toast.error("Could not duplicate");
  }
};

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-destructive">
          Couldn't load this transaction ({error}).
        </p>
        <Link href="/finance/transactions">
          <Button variant="outline" size="sm" className="mt-3">
            Back to transactions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
    <div className="flex items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={handleDuplicate}
  >
    <Copy className="mr-1 h-4 w-4" />
    Duplicate
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={handleDelete}
    className="text-destructive hover:bg-destructive/10"
  >
    <Trash2 className="mr-1 h-4 w-4" />
    Delete
  </Button>
</div>

      <h1 className="text-xl font-bold">Edit transaction</h1>

      <TransactionForm
        initial={txn}
        onSuccess={() => router.push("/finance/transactions")}
      />
    </div>
  );
}