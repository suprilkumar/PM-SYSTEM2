"use client";

import { useRouter } from "next/navigation";
import TransactionForm from "@/modules/finance/components/TransactionForm";
import PageHeader from "@/components/layout/PageHeader";
import FinanceNav from "@/modules/finance/components/FinanceNav";

export default function NewTransactionPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 md:p-6">
      <PageHeader
        title="Add transaction"
        description="Record a new income or expense"
        breadcrumbs={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions", href: "/finance/transactions" },
          { label: "New" },
        ]}
      />
      <div className="mt-4">
    <FinanceNav />
    </div>
      <TransactionForm onSuccess={() => router.push("/finance")} />
    </div>
  );
}