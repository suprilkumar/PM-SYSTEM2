// src/app/(app)/finance/transactions/page.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useTransactions } from "@/modules/finance/hooks/useTransactions";
import TransactionRow from "@/modules/finance/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";
import PageHeader from "@/components/layout/PageHeader";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const { transactions, loading, remove } = useTransactions({ search, type });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        <PageHeader
        title="Transactions"
        description="All your income and expenses"
        breadcrumbs={[
          { label: "Finance", href: "/finance" },
          { label: "Transactions" },
        ]}
        actions={
          <Link href="/finance/transactions/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </Link>
        }
      />
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Transactions</h1>
        <Link href="/finance/transactions/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions…"
          className="pl-9"
        />
      </div>

      <div className="flex gap-1 rounded-lg border p-1">
        {[
          { v: "", label: "All" },
          { v: "income", label: "Income" },
          { v: "expense", label: "Expense" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setType(f.v)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs transition",
              type === f.v
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No transactions match.
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {transactions.map((t) => (
            <TransactionRow key={t.id} txn={t} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}