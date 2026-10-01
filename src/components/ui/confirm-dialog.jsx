// src/components/ui/confirm-dialog.jsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

/**
 * Reusable confirm dialog.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   onConfirm: () => void | Promise<void>
 *   title: string
 *   description?: string
 *   confirmLabel?: string  (default "Delete")
 *   cancelLabel?: string   (default "Cancel")
 *   variant?: "destructive" | "default"
 *   loading?: boolean
 */
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  variant = "destructive",
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const Icon = variant === "destructive" ? AlertTriangle : X;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => !loading && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="animate-scale-in w-full max-w-sm rounded-2xl border border-border/70 bg-popover p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              variant === "destructive"
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              id="confirm-title"
              className="text-sm font-semibold leading-tight"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="sm:min-w-[80px]"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className="sm:min-w-[80px]"
          >
            {loading ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}