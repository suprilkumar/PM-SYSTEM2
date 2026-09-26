// src/components/layout/MobileNav.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { APPS } from "@/core/config/apps";
import { cn } from "@/core/utils/cn";

export default function MobileNav() {
  const pathname = usePathname();
  const items = APPS.filter((a) => a.mobileNav).slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background md:hidden">
      {items.map((app) => {
        const C = Icons[app.icon] ?? Icons.Circle;
        const active = pathname.startsWith(app.href);
        return (
          <Link
            key={app.id}
            href={app.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <C className="h-5 w-5" />
            {app.name}
          </Link>
        );
      })}
    </nav>
  );
}