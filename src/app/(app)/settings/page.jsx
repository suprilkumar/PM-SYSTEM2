// src/app/(app)/settings/page.js
import { getCurrentUser } from "@/core/auth/session";
import { prisma } from "@/core/db/client";
import Link from "next/link";
import { ChevronRight, User, Bell, Shield, Database, Palette } from "lucide-react";

export const metadata = { title: "Settings" };

const SECTIONS = [
  { href: "/settings/profile", icon: User, title: "Profile", desc: "Name, email, avatar" },
  { href: "/settings/notifications", icon: Bell, title: "Notifications", desc: "Email preferences" },
  { href: "/settings/security", icon: Shield, title: "Security", desc: "Sessions and access" },
  { href: "/settings/appearance", icon: Palette, title: "Appearance", desc: "Theme, colors" },
  { href: "/settings/data", icon: Database, title: "Your data", desc: "Export or delete" },
];

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true, image: true, createdAt: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Profile card */}
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
        {dbUser.image ? (
          <img
            src={dbUser.image}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {(dbUser.name ?? dbUser.email)[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold">{dbUser.name ?? "Anonymous"}</div>
          <div className="text-xs text-muted-foreground">{dbUser.email}</div>
        </div>
        <Link
          href="/settings/profile"
          className="rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
        >
          Edit
        </Link>
      </div>

      <div className="divide-y overflow-hidden rounded-xl border bg-card">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="flex items-center gap-3 p-4 transition hover:bg-accent/50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="text-sm font-semibold text-destructive">Danger zone</div>
        <p className="mt-1 text-xs text-muted-foreground">
          Deleting your account will permanently remove all your data.
        </p>
        <Link
          href="/settings/data"
          className="mt-3 inline-block rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
        >
          Manage data
        </Link>
      </div>
    </div>
  );
}