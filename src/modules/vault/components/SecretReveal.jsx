"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/core/utils/cn";

const CLEAR_MS = 30_000;

export default function SecretReveal({ value, label = "Password", compact = false }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`, {
        description: "Clipboard clears in 30s",
      });

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === value) await navigator.clipboard.writeText("");
        } catch {}
        setCopied(false);
      }, CLEAR_MS);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const masked = "•".repeat(Math.min(16, value?.length ?? 0));

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-muted/30",
        compact ? "px-1.5 py-1" : "p-1"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={cn(
          "flex-1 truncate font-mono",
          compact ? "max-w-[140px] text-[11px]" : "text-sm",
          !revealed && "tracking-wider text-muted-foreground"
        )}
      >
        {revealed ? value : masked}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setRevealed((r) => !r);
        }}
        className={cn(
          "grid place-items-center rounded text-muted-foreground transition hover:bg-accent hover:text-foreground",
          compact ? "h-6 w-6" : "h-7 w-7"
        )}
        aria-label={revealed ? "Hide" : "Reveal"}
        title={revealed ? "Hide" : "Reveal"}
      >
        {revealed ? (
          <EyeOff className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        ) : (
          <Eye className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        )}
      </button>
      <button
        type="button"
        onClick={copy}
        className={cn(
          "grid place-items-center rounded transition",
          compact ? "h-6 w-6" : "h-7 w-7",
          copied
            ? "bg-emerald-500/15 text-emerald-600"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        aria-label="Copy"
        title="Copy (clears in 30s)"
      >
        {copied ? (
          <Check className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        ) : (
          <Copy className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        )}
      </button>
    </div>
  );
}