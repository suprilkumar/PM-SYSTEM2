// src/components/layout/Sidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { APPS, SETTINGS_ITEM } from "@/core/config/apps";
import { cn } from "@/core/utils/cn";

function Icon({ name, ...props }) {
  const C = Icons[name] ?? Icons.Circle;
  return <C {...props} />;
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-14 items-center border-b px-4 font-semibold">
        Personal Suite
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {APPS.sort((a, b) => a.order - b.order).map((app) => {
          const active = pathname.startsWith(app.href);
          return (
            <Link
              key={app.id}
              href={app.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon name={app.icon} className="h-4 w-4" />
              {app.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Link
          href={SETTINGS_ITEM.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          <Icon name={SETTINGS_ITEM.icon} className="h-4 w-4" />
          {SETTINGS_ITEM.name}
        </Link>
      </div>
    </aside>
  );
}