// src/components/layout/PageHeader.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/core/utils/cn";

/**
 * Page header with optional back button + breadcrumb trail.
 *
 * Props:
 *   title: string
 *   description?: string
 *   breadcrumbs?: Array<{ label: string, href?: string }>
 *   actions?: ReactNode
 *   showBack?: boolean (default true)
 */
export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  showBack = true,
}) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {/* Back + breadcrumb row */}
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {breadcrumbs.length > 0 && (
          <nav className="flex min-w-0 items-center gap-1 text-xs">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex min-w-0 items-center gap-1">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="truncate text-muted-foreground transition hover:text-foreground"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}