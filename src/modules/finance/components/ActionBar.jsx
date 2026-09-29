// src/modules/finance/components/ActionBar.jsx
"use client";

import Link from "next/link";
import { Plus, FolderTree, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionBar() {
  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      <Link href="/finance/transactions/new">
        <Button size="sm" className="h-9 gap-1.5 px-3">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </Link>
      <Link href="/finance/categories">
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 sm:w-auto sm:px-3">
          <FolderTree className="h-4 w-4" />
          <span className="hidden sm:ml-1.5 sm:inline">Categories</span>
        </Button>
      </Link>
      <Link href="/finance/reports">
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 sm:w-auto sm:px-3">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:ml-1.5 sm:inline">Reports</span>
        </Button>
      </Link>
    </div>
  );
}