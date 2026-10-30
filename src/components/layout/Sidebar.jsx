// src/components/layout/Sidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { APPS, SETTINGS_ITEM } from "@/core/config/apps";
import { cn } from "@/core/utils/cn";
import { emit } from "@/core/utils/events";
import { useVaultStatus } from "@/modules/vault/hooks/useVaultStatus";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-background/80 backdrop-blur-xl md:flex">
      {/* Brand — fixed */}
      <Link
        href="/dashboard"
        className="group flex h-14 shrink-0 items-center gap-2.5 border-b border-border/60 px-4 font-semibold"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary via-fuchsia-500 to-magenta-500 text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
          P
        </span>
        <span className="text-[15px] tracking-tight">Personal Suite</span>
      </Link>

      {/* Apps — scrollable area */}
      <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
        {APPS.sort((a, b) => a.order - b.order).map((app) => (
          <SidebarItem key={app.id} item={app} pathname={pathname} />
        ))}
      </nav>

      {/* Settings — fixed bottom */}
      <div className="shrink-0 border-t border-border/60 p-3">
        <SidebarItem item={SETTINGS_ITEM} pathname={pathname} />
      </div>

   
    </aside>
  );
}

function SidebarItem({ item, pathname }) {
  const Icon = Icons[item.icon] ?? Icons.Circle;
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  const [open, setOpen] = useState(isActive);
  const contentRef = useRef(null);

  const isVault = item.id === "vault";
  const { unlocked } = useVaultStatus();

  const visibleChildren = isVault
    ? unlocked
      ? item.children ?? []
      : (item.children ?? []).slice(0, 1)
    : item.children ?? [];

  // Auto-open the group when the route changes into it
  useEffect(() => {
    if (isActive && hasChildren) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── No children: simple gradient CTA link ──
  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-lg shadow-primary/30"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {isActive && (
          <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
            isActive && "drop-shadow-sm"
          )}
        />
        <span className="relative">{item.name}</span>
        {isActive && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
        )}
      </Link>
    );
  }

  // ── Locked vault: single flat gradient link ──
  if (isVault && !unlocked) {
    return (
      <Link
        href="/vault"
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-lg shadow-primary/30"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
        <span className="relative flex-1">{item.name}</span>
        <Icons.Lock className="h-3 w-3 opacity-70" />
      </Link>
    );
  }

  // ── Accordion with gradient active state ──
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl transition-all duration-200",
        isActive && "bg-gradient-to-br from-primary/10 via-magenta-500/5 to-transparent ring-1 ring-primary/20"
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200",
          isActive
            ? "font-semibold text-primary"
            : "font-medium text-muted-foreground hover:text-foreground"
        )}
        aria-expanded={open}
      >
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-all duration-200",
            isActive
              ? "bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-md shadow-primary/30"
              : "bg-muted/60 text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="flex-1 text-left">{item.name}</span>
        <Icons.ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-300",
            open && "rotate-180",
            isActive ? "text-primary" : "text-muted-foreground/60"
          )}
        />
      </button>

      <div
        ref={contentRef}
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-primary/20 pb-1 pl-3 pr-2">
            {visibleChildren.map((child) => {
              const CIcon = Icons[child.icon] ?? Icons.Circle;

              // Action-type child
              if (child.action) {
                return (
                  <button
                    key={child.name}
                    onClick={() => {
                      emit(child.action, {});
                      if (!pathname.startsWith("/notes")) {
                        window.location.href = "/notes";
                      }
                    }}
                    className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-all duration-150 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent hover:text-primary"
                  >
                    <CIcon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="flex-1">{child.name}</span>
                    <Icons.Plus className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                );
              }

              // Route child
              const childActive =
                pathname === child.href ||
                (child.href !== item.href && pathname.startsWith(child.href + "/"));

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150",
                    childActive
                      ? "bg-gradient-to-r from-primary to-magenta-500 font-semibold text-primary-foreground shadow-sm shadow-primary/25"
                      : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <CIcon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-110",
                      childActive && "drop-shadow-sm"
                    )}
                  />
                  <span className="flex-1">{child.name}</span>
                  {childActive && (
                    <Icons.ChevronRight className="h-3 w-3 opacity-70" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}