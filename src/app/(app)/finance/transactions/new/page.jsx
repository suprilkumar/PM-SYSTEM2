// src/app/(app)/finance/transactions/new/page.jsx
"use client";
import { useRouter } from "next/navigation";
import TransactionForm from "@/modules/finance/components/TransactionForm";
import { Button } from "@/components/ui/button";

export default function NewTransactionPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← Back
      </Button>
      <h1 className="text-xl font-bold">Add transaction</h1>
      <TransactionForm
        onSuccess={() => router.push("/finance")}
      />
    </div>
  );
}