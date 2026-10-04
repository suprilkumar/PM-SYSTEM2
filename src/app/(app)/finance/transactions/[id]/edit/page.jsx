"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import TransactionForm from "@/modules/finance/components/TransactionForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Trash2, Copy } from "lucide-react";
import { invalidateFinanceCache } from "@/modules/finance/lib/cache";

export default function EditTransactionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete");
      await invalidateFinanceCache();
      toast.success("Moved to trash");
      router.push("/finance/transactions");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
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
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 md:p-6">
      <PageHeader
        title="Edit transaction"
        description={txn?.category?.name ?? ""}
        breadcrumbs={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions", href: "/finance/transactions" },
          { label: "Edit" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        }
      />

      <TransactionForm
        initial={txn}
        onSuccess={() => router.push("/finance/transactions")}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this transaction?"
        description={`${txn?.category?.name ?? ""} · ${txn?.description ?? ""} · ${txn?.amount ?? ""}`}
        confirmLabel="Move to trash"
      />
    </div>
  );
}