// src/modules/finance/components/FinanceNav.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  List,
  Plus,
  FolderTree,
  PieChart,
} from "lucide-react";
import { cn } from "@/core/utils/cn";

const LINKS = [
  { href: "/finance", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/finance/transactions", label: "Transactions", icon: List },
  { href: "/finance/transactions/new", label: "Add", icon: Plus },
  { href: "/finance/categories", label: "Categories", icon: FolderTree },
  { href: "/finance/reports", label: "Reports", icon: PieChart },
];

export default function FinanceNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1.5">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}