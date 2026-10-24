"use client";

import useSWR from "swr";
import { Activity, Lock, Unlock, Plus, Trash2, Pencil, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/core/utils/cn";

const ACTION_ICONS = {
  create: { icon: Plus, color: "text-emerald-600", label: "Created item" },
  update: { icon: Pencil, color: "text-blue-600", label: "Updated item" },
  read: { icon: Activity, color: "text-muted-foreground", label: "Viewed item" },
  delete: { icon: Trash2, color: "text-destructive", label: "Deleted item" },
  unlock: { icon: Unlock, color: "text-emerald-600", label: "Unlocked vault" },
  lock: { icon: Lock, color: "text-amber-600", label: "Locked vault" },
  failed_unlock: { icon: AlertTriangle, color: "text-destructive", label: "Failed unlock" },
  setup: { icon: Activity, color: "text-primary", label: "Vault set up" },
};

export default function AuditPage() {
  const { data, isLoading } = useSWR("/api/vault/audit");
  const audits = data?.audits ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <h1 className="text-2xl font-bold tracking-tight">Audit log</h1>
      <p className="text-sm text-muted-foreground">
        Recent activity in your vault
      </p>

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))
        ) : audits.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            No activity yet
          </div>
        ) : (
          audits.map((a) => {
            const meta = ACTION_ICONS[a.action] ?? ACTION_ICONS.read;
            const Icon = meta.icon;
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3"
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted", meta.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{meta.label}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString("en-IN")}
                    {a.ipAddress && ` · ${a.ipAddress}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}