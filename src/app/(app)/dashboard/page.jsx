// src/app/(app)/dashboard/page.js
import Link from "next/link";
import * as Icons from "lucide-react";
import { getCurrentUser } from "@/core/auth/session";
import { APPS } from "@/core/config/apps";
import { prisma } from "@/core/db/client";
import { fmtRelative } from "@/core/utils/date";

export const metadata = { title: "Home" };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [recentNotes, notesCount, archivedCount] = await Promise.all([
    prisma.note.findMany({
      where: { userId: user.id, deletedAt: null, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.note.count({
      where: { userId: user.id, deletedAt: null, isArchived: false },
    }),
    prisma.note.count({
      where: { userId: user.id, deletedAt: null, isArchived: true },
    }),
  ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (user.name ?? user.email).split(" ")[0];
  const appCount = APPS.filter((a) => a.id !== "dashboard").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 pb-16 md:p-8">
      {/* ── Hero greeting ── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-magenta-500/5 to-transparent p-6 md:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-magenta-500/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-primary backdrop-blur">
              <Icons.Sparkles className="h-3 w-3" />
              Your workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {firstName}
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              {notesCount > 0
                ? `You have ${notesCount} active note${notesCount === 1 ? "" : "s"}. Here's what's happening in your workspace.`
                : "Welcome to your workspace — start by creating your first note."}
            </p>
          </div>
          <Link
            href="/notes/new"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-magenta-500 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            <Icons.Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            New note
          </Link>
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard
          href="/notes/new"
          icon="Plus"
          label="New note"
          hint="Start writing"
          primary
        />
        <QuickCard
          href="/notes"
          icon="StickyNote"
          label="All notes"
          hint={`${notesCount} active`}
        />
        <QuickCard
          href="/notes?archived=1"
          icon="Archive"
          label="Archive"
          hint={`${archivedCount} archived`}
        />
        <QuickCard
          href="/settings"
          icon="Settings"
          label="Settings"
          hint="Preferences"
        />
      </section>

      {/* ── Stats row ── */}
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon="StickyNote"
          label="Active notes"
          value={notesCount}
          tone="primary"
        />
        <StatCard
          icon="Archive"
          label="Archived"
          value={archivedCount}
          tone="muted"
        />
        <StatCard
          icon="LayoutGrid"
          label="Apps available"
          value={appCount}
          tone="magenta"
        />
      </section>

      {/* ── Apps grid ── */}
      <section className="space-y-3">
        <SectionHeader
          icon="LayoutGrid"
          title="Your apps"
          hint={`${appCount} available`}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.filter((a) => a.id !== "dashboard").map((app) => {
            const Icon = Icons[app.icon] ?? Icons.Circle;
            return (
              <Link
                key={app.id}
                href={app.href}
                className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary ring-1 ring-primary/10 transition-all group-hover:from-primary group-hover:to-magenta-500 group-hover:text-primary-foreground group-hover:ring-primary/30">
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {app.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {app.description ?? "Open app"}
                  </div>
                </div>
                <Icons.ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Recent notes ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader
            icon="Clock"
            title="Recent notes"
            hint="Your latest edits"
            className="flex-1"
          />
          <Link
            href="/notes"
            className="group inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
          >
            View all
            <Icons.ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Icons.FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No notes yet</p>
              <p className="text-xs text-muted-foreground">
                Create your first note to get started.
              </p>
            </div>
            <Link
              href="/notes/new"
              className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-magenta-500 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition hover:shadow-md active:scale-[0.98]"
            >
              <Icons.Plus className="h-3.5 w-3.5" />
              New note
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
            {recentNotes.map((n, i) => (
              <Link
                key={n.id}
                href={`/notes/${n.id}`}
                className={`group flex items-center gap-3 p-4 transition hover:bg-accent/50 ${
                  i !== 0 ? "border-t border-border/50" : ""
                }`}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted/60 text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                  <Icons.FileText className="h-4 w-4" />
                </div>
                <span className="line-clamp-1 flex-1 text-sm font-medium">
                  {n.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {fmtRelative(n.updatedAt)}
                </span>
                <Icons.ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ── */

function SectionHeader({ icon, title, hint, className = "" }) {
  const Icon = Icons[icon] ?? Icons.Circle;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {hint && (
        <span className="text-xs text-muted-foreground">· {hint}</span>
      )}
    </div>
  );
}

function QuickCard({ href, icon, label, hint, primary }) {
  const Icon = Icons[icon] ?? Icons.Circle;
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        primary
          ? "border-primary/40 bg-gradient-to-br from-primary/10 to-magenta-500/5 hover:shadow-primary/10"
          : "border-border/60 bg-card hover:border-primary/25 hover:shadow-primary/5"
      }`}
    >
      {primary && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/15 blur-2xl"
        />
      )}
      <div
        className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-all ${
          primary
            ? "bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-md shadow-primary/25"
            : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}
      >
        <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{label}</div>
        <div className="truncate text-xs text-muted-foreground">{hint}</div>
      </div>
      <Icons.ChevronRight className="relative h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function StatCard({ icon, label, value, tone = "primary" }) {
  const Icon = Icons[icon] ?? Icons.Circle;
  const tones = {
    primary: "from-primary/15 to-primary/5 text-primary ring-primary/15",
    magenta:
      "from-magenta-500/15 to-magenta-500/5 text-magenta-500 ring-magenta-500/15",
    muted:
      "from-muted-foreground/10 to-muted-foreground/5 text-muted-foreground ring-muted-foreground/15",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br ring-1 ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold leading-none tracking-tight">
          {value}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}