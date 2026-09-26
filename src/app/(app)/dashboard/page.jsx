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

  const [recentNotes, notesCount] = await Promise.all([
    prisma.note.findMany({
      where: { userId: user.id, deletedAt: null, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.note.count({
      where: { userId: user.id, deletedAt: null, isArchived: false },
    }),
  ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (user.name ?? user.email).split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening in your workspace.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard href="/notes/new" icon="Plus" label="New note" hint="Start writing" primary />
        <QuickCard href="/notes" icon="StickyNote" label="All notes" hint={`${notesCount} total`} />
        <QuickCard href="/settings" icon="User" label="Profile" hint="Manage account" />
        <QuickCard href="/settings" icon="Bell" label="Reminders" hint="Coming soon" />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Your apps</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.filter((a) => a.id !== "dashboard").map((app) => {
            const Icon = Icons[app.icon] ?? Icons.Circle;
            return (
              <Link
                key={app.id}
                href={app.href}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition hover:shadow-md"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">Open</div>
                </div>
                <Icons.ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Recent notes</h2>
          <Link href="/notes" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No notes yet.{" "}
            <Link href="/notes/new" className="text-primary hover:underline">
              Create your first one
            </Link>
            .
          </div>
        ) : (
          <div className="divide-y rounded-xl border bg-card">
            {recentNotes.map((n) => (
              <Link
                key={n.id}
                href={`/notes/${n.id}`}
                className="flex items-center justify-between p-4 transition hover:bg-accent/50"
              >
                <span className="line-clamp-1 font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground">
                  {fmtRelative(n.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuickCard({ href, icon, label, hint, primary }) {
  const Icon = Icons[icon] ?? Icons.Circle;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl border p-4 transition hover:shadow-md ${
        primary ? "border-primary/40 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-background">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
    </Link>
  );
}