// src/app/home/Header.jsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSession } from "@/core/auth/client";
import { SITE } from "@/core/config/site";
import { PUBLIC_LINKS } from "@/core/config/apps";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import { cn } from "@/core/utils/cn";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const isAuthed = !!session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            P
          </span>
          {SITE.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {Object.values(PUBLIC_LINKS).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {l.name}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isPending ? null : isAuthed ? (
            <Link href="/dashboard">
              <Button size="sm">Open App</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="rounded-md p-2"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t md:hidden",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="space-y-1 p-4">
          {Object.values(PUBLIC_LINKS).map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              {l.name}
            </a>
          ))}
          <div className="mt-3 flex gap-2 pt-3">
            {isAuthed ? (
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Open App</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button className="w-full">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}