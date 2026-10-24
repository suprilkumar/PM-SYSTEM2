"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import { Star, KeyRound } from "lucide-react";
import { TEMPLATES } from "../templates";
import { cn } from "@/core/utils/cn";

export default function VaultItemCard({ item }) {
  const template = TEMPLATES[item.kind] ?? TEMPLATES.custom;
  const Icon = Icons[template.icon] ?? KeyRound;

  // Show first non-sensitive text field as a subtitle
  const subtitleField = item.payload?.fields?.find(
    (f) => !f.sensitive && f.value && f.type !== "textarea"
  );

  return (
    <Link
      href={`/vault/items/${item.id}`}
      className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            backgroundColor: template.color + "20",
            color: template.color,
          }}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{item.label}</div>
          <div className="truncate text-xs text-muted-foreground">
            {subtitleField?.value ?? template.label}
          </div>
        </div>

        {item.isFavorite && (
          <Star className="h-4 w-4 shrink-0 fill-current text-amber-500" />
        )}
      </div>

      {item.payload?.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {item.payload.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 text-[10px] text-muted-foreground">
        Updated{" "}
        {new Date(item.updatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        })}
      </div>
    </Link>
  );
}