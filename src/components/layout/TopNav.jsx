// src/components/layout/TopNav.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { useSession, signOut } from "@/core/auth/client";
import { APPS } from "@/core/config/apps";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "@/core/utils/cn";

export default function TopNav({ showApps = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user;
  const initial = (user?.name ?? user?.email ?? "U")[0].toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const apps = APPS.filter((a) => a.id !== "dashboard").slice(0, 5);

  return (
    <>
      {/* Backdrop when profile menu is open (mobile) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 flex justify-center",
          "transition-all duration-300 ease-out",
          scrolled ? "pt-3" : "pt-0"
        )}
      >
        <div
          className={cn(
            "w-full transition-all duration-300 ease-out",
            scrolled
              ? [
                  "mx-3 max-w-5xl rounded-full border border-border/70",
                  "bg-background/85 backdrop-blur-xl",
                  "shadow-lg shadow-primary/5",
                  "supports-[backdrop-filter]:bg-background/70",
                ].join(" ")
              : "rounded-none border-b border-border/60 bg-background/80 backdrop-blur-md"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 px-3 transition-all duration-300 md:gap-3 md:px-6",
              scrolled ? "h-12" : "h-14"
            )}
          >
            {/* Brand */}
            <Link
              href="/dashboard"
              className="group flex shrink-0 items-center gap-2 font-semibold"
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                P
              </span>
              <span
                className={cn(
                  "hidden text-[15px] tracking-tight sm:block",
                  scrolled && "sm:hidden lg:block"
                )}
              >
                Personal Suite
              </span>
            </Link>

            {/* App tabs */}
            {showApps && (
              <nav className="mx-auto flex items-center gap-1">
                {apps.map((app) => {
                  const Icon = Icons[app.icon] ?? Icons.Circle;
                  const active =
                    pathname === app.href ||
                    pathname.startsWith(app.href + "/");
                  return (
                    <Link
                      key={app.id}
                      href={app.href}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-all md:px-3 md:py-2",
                        active
                          ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span
                        className={cn(
                          "hidden",
                          active ? "inline md:inline" : "md:hidden",
                          "md:ml-1"
                        )}
                      >
                        {app.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right cluster */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
              <ThemeToggle />

              <button
                onClick={() => setMenuOpen((o) => !o)}
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full border border-transparent transition",
                  menuOpen
                    ? "border-primary/40 ring-2 ring-primary/20"
                    : "hover:bg-accent"
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
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta-500 text-[11px] font-semibold text-primary-foreground">
                    {initial}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile dropdown — floating sheet on mobile, positioned dropdown on desktop */}
      {menuOpen && (
        <>
          {/* Mobile: sheet above bottom */}
          <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
            <ProfileSheet
              user={user}
              initial={initial}
              onSignOut={handleSignOut}
              onClose={() => setMenuOpen(false)}
            />
          </div>

          {/* Desktop: top-right dropdown */}
          <div className="fixed right-6 top-16 z-50 hidden w-64 md:block">
            <ProfileSheet
              user={user}
              initial={initial}
              onSignOut={handleSignOut}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}

function ProfileSheet({ user, initial, onSignOut, onClose }) {
  const links = [
    { label: "Profile", href: "/settings/profile", icon: Icons.User },
    { label: "Settings", href: "/settings", icon: Icons.Settings },
    { label: "Notifications", href: "/settings/notifications", icon: Icons.Bell },
  ];

  return (
    <div className="animate-scale-in overflow-hidden rounded-2xl border border-border/70 bg-popover/95 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-border/60 p-3">
        {user?.image ? (
          <img
            src={user.image}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta-500 text-sm font-semibold text-primary-foreground">
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

      <div className="p-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition active:bg-accent hover:bg-accent"
          >
            <l.icon className="h-4 w-4 text-muted-foreground" />
            {l.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-border/60 p-1">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition hover:bg-destructive/10"
        >
          <Icons.LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}