// src/components/layout/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { APPS, SETTINGS_ITEM } from "@/core/config/apps";
import { cn } from "@/core/utils/cn";
import { emit } from "@/core/utils/events";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-background/50 md:flex md:flex-col">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="group flex h-14 items-center gap-2.5 border-b border-border/60 px-4 font-semibold"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
          P
        </span>
        <span className="text-[15px] tracking-tight">Personal Suite</span>
      </Link>

      {/* Apps */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {APPS.sort((a, b) => a.order - b.order).map((app) => (
          <SidebarItem key={app.id} item={app} pathname={pathname} />
        ))}
      </nav>

      {/* Settings */}
      <div className="border-t border-border/60 p-3">
        <SidebarItem item={SETTINGS_ITEM} pathname={pathname} />
      </div>
    </aside>
  );
}

function SidebarItem({ item, pathname }) {
  const Icon = Icons[item.icon] ?? Icons.Circle;
  const hasChildren = item.children?.length > 0;
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  const [open, setOpen] = useState(isActive);

  // Auto-open the group when the route changes into it
  useEffect(() => {
    if (isActive && hasChildren) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-gradient-to-r from-primary/15 to-magenta-500/5 font-medium text-primary shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-gradient-to-r from-primary/15 to-magenta-500/5 font-medium text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        aria-expanded={open}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{item.name}</span>
        <Icons.ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid overflow-hidden transition-all duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/60 pl-3">
            {item.children.map((child) => {
              const CIcon = Icons[child.icon] ?? Icons.Circle;

              // Action-type child — fires an event instead of navigating
              if (child.action) {
                return (
                  <button
                    key={child.name}
                    onClick={() => {
                      emit(child.action, {});
                      // Ensure we're on a notes route so the listener exists
                      if (!pathname.startsWith("/notes")) {
                        window.location.href = "/notes";
                      }
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                  >
                    <CIcon className="h-3.5 w-3.5 shrink-0" />
                    {child.name}
                  </button>
                );
              }

              // Route-type child — normal Link
              const childActive =
                pathname === child.href ||
                (child.href !== item.href && pathname.startsWith(child.href + "/"));

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-all",
                    childActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <CIcon className="h-3.5 w-3.5 shrink-0" />
                  {child.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}