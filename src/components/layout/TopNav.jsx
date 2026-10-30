// src/components/layout/TopNav.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Icons from "lucide-react";
import { APPS } from "@/core/config/apps";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/components/layout/UserMenu";
import { cn } from "@/core/utils/cn";

export default function TopNav({
  showApps = true,
  brandName = "Personal Suite",
  brandLogo = null,
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const apps = APPS.filter((a) => a.id !== "dashboard").slice(0, 5);

  return (
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
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Icons.Command className="h-4 w-4" />
              )}
            </span>
            <span className="hidden max-w-[140px] truncate text-[15px] tracking-tight sm:block">
              {brandName}
            </span>
          </Link>

          {/* App tabs */}
          {showApps && (
            <nav className="mx-auto flex items-center gap-1 overflow-x-auto">
              {apps.map((app) => {
                const Icon = Icons[app.icon] ?? Icons.Circle;
                const active =
                  pathname === app.href ||
                  pathname.startsWith(app.href + "/");
                return (
                  <Link
                    key={app.id}
                    href={app.href}
                    title={app.name}
                    aria-label={app.name}
                    className={cn(
                      "group relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm shadow-primary/25 md:px-3 md:py-2"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="ml-0.5 hidden sm:inline">
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
            <UserMenu align="right" />
          </div>
        </div>
      </div>
    </header>
  );
}