// src/components/layout/FloatingNav.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { useSession, signOut } from "@/core/auth/client";
import { APPS } from "@/core/config/apps";
import { cn } from "@/core/utils/cn";

export default function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "U")[0].toUpperCase();

  // Cap nav items so the capsule doesn't overflow. First 4 apps.
  const navApps = APPS.filter((a) => a.mobileNav).slice(0, 4);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Backdrop when menu open */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Floating capsule */}
      <nav
        className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-between gap-1 rounded-full border bg-background/95 p-1.5 shadow-lg backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {navApps.map((app) => {
          const Icon = Icons[app.icon] ?? Icons.Circle;
          const active = pathname === app.href || pathname.startsWith(app.href + "/");
          return (
            <Link
              key={app.id}
              href={app.href}
              className={cn(
                "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full transition",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {active && (
                <span className="text-[11px] font-medium">{app.name}</span>
              )}
            </Link>
          );
        })}

        {/* Profile avatar */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
            menuOpen ? "ring-2 ring-primary" : ""
          )}
          aria-label="Open profile menu"
        >
          {user?.image ? (
            <img
              src={user.image}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {initial}
            </span>
          )}
        </button>
      </nav>

      {/* Profile menu — floating sheet above the capsule */}
      {menuOpen && (
        <div
          className="fixed inset-x-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 fade-in rounded-2xl border bg-popover p-1.5 shadow-xl md:hidden"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 rounded-xl border-b p-3 pb-2">
            {user?.image ? (
              <img
                src={user.image}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initial}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {user?.name ?? "Anonymous"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <MenuLink
              icon={Icons.User}
              label="Profile"
              href="/settings/profile"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              icon={Icons.Settings}
              label="Settings"
              href="/settings"
              onClick={() => setMenuOpen(false)}
            />
            <MenuLink
              icon={Icons.Bell}
              label="Notifications"
              href="/settings/notifications"
              onClick={() => setMenuOpen(false)}
            />
          </div>

          <div className="border-t py-1">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition active:bg-destructive/10"
            >
              <Icons.LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MenuLink({ icon: Icon, label, href, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition active:bg-accent"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  );
}