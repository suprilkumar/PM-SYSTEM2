// src/app/(app)/finance/page.jsx
"use client";
import Link from "next/link";
import { Plus, BarChart3 } from "lucide-react";
import { useFinanceDashboard } from "@/modules/finance/hooks/useFinanceDashboard";
import SummaryCards from "@/modules/finance/components/SummaryCards";
import TransactionRow from "@/modules/finance/components/TransactionRow";
import { Button } from "@/components/ui/button";

export default function FinanceHomePage() {
  const { data, loading } = useFinanceDashboard();

  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/finance/reports">
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-1 h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Link href="/finance/transactions/new">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </Link>
        </div>
      </div>

      {loading || !data ? (
        <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : (
        <>
          <SummaryCards summary={data.summary} />

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Recent transactions
              </h2>
              <Link
                href="/finance/transactions"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            {data.recentTransactions.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No transactions yet.{" "}
                <Link href="/finance/transactions/new" className="text-primary hover:underline">
                  Add one
                </Link>
                .
              </div>
            ) : (
              <div className="divide-y rounded-xl border bg-card">
                {data.recentTransactions.map((t) => (
                  <TransactionRow key={t.id} txn={t} />
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/finance/categories"
              className="rounded-xl border bg-card p-4 transition hover:shadow-md"
            >
              <div className="text-sm font-semibold">Categories</div>
              <div className="text-xs text-muted-foreground">
                Manage domains and custom entries
              </div>
            </Link>
            <Link
              href="/finance/reports"
              className="rounded-xl border bg-card p-4 transition hover:shadow-md"
            >
              <div className="text-sm font-semibold">Analytics</div>
              <div className="text-xs text-muted-foreground">
                Monthly, quarterly, yearly views
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}