// src/components/layout/UserMenu.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut, Settings, User, Bell, ChevronDown, Shield,
} from "lucide-react";
import { useSession, signOut } from "@/core/auth/client";
import { SETTINGS_ITEM } from "@/core/config/apps";
import { cn } from "@/core/utils/cn";

const MENU_LINKS = [
  { label: "Profile",       href: "/settings/profile",       icon: User },
  { label: SETTINGS_ITEM.name, href: SETTINGS_ITEM.href,     icon: Settings },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Security",      href: "/settings/security",      icon: Shield },
];

export default function UserMenu({ align = "right" }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const ref = useRef(null);

  // Ensure the SSR HTML and the first client render match:
  // both render the same "loading" shell until mounted flips.
  useEffect(() => setMounted(true), []);

  const user    = session?.user;
  const initial = (user?.name ?? user?.email ?? "U")[0].toUpperCase();
  const ready   = mounted && status !== "loading";

  /* outside-click */
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  /* Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + "/");

  // Same shell on server + client to avoid mismatch
  if (!ready) {
    return (
      <div className="relative">
        <button
          aria-label="Account"
          className="flex items-center gap-2 rounded-full border border-transparent p-0.5 pr-2.5 transition-all"
        >
          <span className="h-7 w-7 rounded-full bg-muted" />
          <span className="hidden h-4 w-14 rounded bg-muted md:inline-block" />
          <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:inline" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className={cn(
          "group flex items-center gap-2 rounded-full border border-transparent p-0.5 pr-2.5 transition-all",
          open
            ? "border-primary/40 bg-accent ring-2 ring-primary/20"
            : "hover:border-border/60 hover:bg-accent"
        )}
      >
        {user?.image ? (
          <img
            src={user.image}
            alt=""
            className="h-7 w-7 rounded-full object-cover ring-1 ring-border/60"
          />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta-500 text-[11px] font-semibold text-primary-foreground shadow-sm">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[110px] truncate text-sm font-medium md:inline">
          {user?.name?.split(" ")[0] ?? user?.email ?? "Account"}
        </span>
        <ChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 md:inline",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "animate-scale-in absolute z-50 mt-2 w-64 origin-top overflow-hidden rounded-2xl border border-border/70 bg-popover/95 shadow-2xl backdrop-blur-xl",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="flex items-center gap-3 border-b border-border/60 p-3">
            {user?.image ? (
              <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-border/60" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta-500 text-sm font-semibold text-primary-foreground shadow-sm">
                {initial}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user?.name ?? "Anonymous"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>

          <div className="p-1">
            {MENU_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/80 hover:bg-accent hover:text-foreground"
                  )}
                >
                  <l.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="flex-1">{l.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border/60 p-1">
            <button
              onClick={handleSignOut}
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}