// src/app/home/Header.jsx
// src/components/marketing/Header.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/core/auth/client";
import { SITE } from "@/core/config/site";
import { PUBLIC_LINKS } from "@/core/config/apps";
import SmartNav from "@/components/layout/SmartNav";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const isAuthed = !!session?.user;

  return (
    <SmartNav>
      {/* Brand */}
      <Link
        href="/"
        className="group flex items-center gap-2.5 font-semibold transition"
      >
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            "bg-gradient-to-br from-primary to-magenta-500",
            "text-primary-foreground shadow-sm",
            "transition-transform group-hover:scale-105"
          )}
        >
          P
        </span>
        <span className="text-[15px] tracking-tight">{SITE.name}</span>
      </Link>

      {/* Center links */}
      <nav className="ml-6 hidden items-center gap-1 md:flex">
        {Object.values(PUBLIC_LINKS).map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm text-muted-foreground",
              "transition hover:bg-accent hover:text-foreground"
            )}
          >
            {l.name}
          </a>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:flex md:items-center md:gap-2">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-24 rounded-lg skeleton" />
          ) : isAuthed ? (
            <Link href="/dashboard">
              <Button size="sm" className="group">
                Open app
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="group">
                  Get started
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg",
              "text-muted-foreground transition hover:bg-accent hover:text-foreground"
            )}
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 px-4 md:hidden">
          <div className="animate-scale-in overflow-hidden rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-xl backdrop-blur-xl">
            <div className="space-y-0.5">
              {Object.values(PUBLIC_LINKS).map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  {l.name}
                </a>
              ))}
            </div>

            <div className="mt-2 flex gap-2 border-t pt-2">
              {isAuthed ? (
                <Link href="/dashboard" className="flex-1" onClick={() => setOpen(false)}>
                  <Button className="w-full">Open app</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/login" className="flex-1" onClick={() => setOpen(false)}>
                    <Button className="w-full">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </SmartNav>
  );
}