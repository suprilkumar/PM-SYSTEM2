"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/core/utils/cn";

export default function SettingsModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  busy = false,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => !busy && onClose?.()}
    >
      <div
        className={cn(
          "animate-scale-in flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-2xl",
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            onClick={() => !busy && onClose?.()}
            disabled={busy}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-accent disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 p-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}