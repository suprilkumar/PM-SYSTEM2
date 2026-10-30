"use client";

import { useMemo } from "react";
import useSWR from "swr";
import {
  Activity,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Pencil,
  AlertTriangle,
  KeyRound,
  Eye,
  ScrollText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/core/utils/cn";

const ACTION_META = {
  setup: { icon: KeyRound, color: "text-primary", bg: "bg-primary/10", label: "Vault set up" },
  create: { icon: Plus, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Created item" },
  update: { icon: Pencil, color: "text-blue-600", bg: "bg-blue-500/10", label: "Updated item" },
  read: { icon: Eye, color: "text-muted-foreground", bg: "bg-muted", label: "Viewed item" },
  delete: { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10", label: "Deleted item" },
  unlock: { icon: Unlock, color: "text-emerald-600", bg: "bg-emerald-500/10", label: "Unlocked vault" },
  lock: { icon: Lock, color: "text-amber-600", bg: "bg-amber-500/10", label: "Locked vault" },
  failed_unlock: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Failed unlock" },
  pin_change: { icon: KeyRound, color: "text-blue-600", bg: "bg-blue-500/10", label: "Changed PIN" },
  password_change: { icon: Lock, color: "text-blue-600", bg: "bg-blue-500/10", label: "Changed password" },
  recovery_request: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/10", label: "Recovery requested" },
  recovery_verified: { icon: Unlock, color: "text-primary", bg: "bg-primary/10", label: "Recovery verified" },
  recovery_complete: { icon: Unlock, color: "text-primary", bg: "bg-primary/10", label: "Recovery complete" },
};

export default function AuditPage() {
  const { data, isLoading } = useSWR("/api/vault/audit");
  const audits = data?.audits ?? [];

  const { grouped, summary } = useMemo(() => {
    const grouped = {};
    const summary = { total: audits.length, unlocks: 0, failedUnlocks: 0, today: 0 };
    const today = new Date().toDateString();

    for (const a of audits) {
      const date = new Date(a.createdAt).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(a);

      if (a.action === "unlock") summary.unlocks++;
      if (a.action === "failed_unlock") summary.failedUnlocks++;
      if (date === today) summary.today++;
    }

    return { grouped, summary };
  }, [audits]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow">
          <ScrollText className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">
            Every action taken in your vault
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard label="Total events" value={summary.total} icon={Activity} />
        <SummaryCard label="Today" value={summary.today} icon={Activity} accent="text-primary" />
        <SummaryCard label="Unlocks" value={summary.unlocks} icon={Unlock} accent="text-emerald-600" />
        <SummaryCard
          label="Failed attempts"
          value={summary.failedUnlocks}
          icon={AlertTriangle}
          accent={summary.failedUnlocks > 0 ? "text-destructive" : "text-muted-foreground"}
        />
      </div>

      {/* Timeline */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : audits.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            No activity recorded yet.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, events]) => (
              <div key={date}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {formatDate(date)}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] text-muted-foreground">
                    {events.length} event{events.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="relative space-y-1.5 pl-6">
                  <div className="absolute bottom-0 left-2 top-0 w-px bg-border/60" />
                  {events.map((event) => {
                    const meta = ACTION_META[event.action] ?? ACTION_META.read;
                    const Icon = meta.icon;
                    return (
                      <div
                        key={event.id}
                        className="relative rounded-xl border border-border/70 bg-card p-3 transition hover:border-primary/30"
                      >
                        <div className="absolute -left-[18px] top-4 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-border" />
                        <div className="flex items-start gap-3">
                          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", meta.bg, meta.color)}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-sm font-medium">
                                {meta.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(event.createdAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>
                            {event.itemId && (
                              <div className="mt-0.5 text-[11px] font-mono text-muted-foreground">
                                {event.itemId.slice(0, 12)}…
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, accent = "text-foreground" }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={cn("mt-1 text-2xl font-semibold tabular-nums", accent)}>
        {value}
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}