// src/modules/finance/components/ActionBar.jsx
"use client";

import Link from "next/link";
import { Plus, FolderTree, BarChart3, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/finance/transactions/new">
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add transaction
        </Button>
      </Link>
      <Link href="/finance/categories">
        <Button size="sm" variant="outline" className="gap-1.5">
          <FolderTree className="h-4 w-4" />
          Categories
        </Button>
      </Link>
      <Link href="/finance/reports">
        <Button size="sm" variant="outline" className="gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Full reports
        </Button>
      </Link>
    </div>
  );
}