// src/modules/finance/components/TransactionRow.jsx
"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { formatSigned } from "../lib/format";
import { cn } from "@/core/utils/cn";

export default function TransactionRow({ txn, onDelete, href }) {
  const isIncome = txn.type === "income";
  const displayCat = txn.category;
  const target = href ?? `/finance/transactions/${txn.id}/edit`;

  return (
    <div className="group relative flex items-center gap-3 p-3 transition hover:bg-accent/40">
      {/* Full-row link overlay */}
      <Link
        href={target}
        className="absolute inset-0 z-0"
        aria-label={`Edit transaction ${displayCat?.name ?? ""}`}
      />

      <div
        className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: (displayCat?.color ?? "#64748b") + "20",
          color: displayCat?.color ?? "#64748b",
        }}
      >
        <CategoryIcon name={displayCat?.icon ?? "Circle"} size={16} />
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          {displayCat?.name ?? "Unknown"}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {txn.parentCategory?.name && `${txn.parentCategory.name} · `}
          {txn.description || new Date(txn.date).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 text-sm font-semibold tabular-nums",
          isIncome ? "text-green-600" : "text-red-600"
        )}
      >
        {formatSigned(isIncome ? Number(txn.amount) : -Number(txn.amount))}
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(txn.id);
          }}
          className="relative z-10 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}