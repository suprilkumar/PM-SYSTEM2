"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/core/utils/cn";

const CLEAR_TIMEOUT = 30_000;

export default function SecretField({ label, value, type = "password" }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const clearTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`, {
        description: `Clears in 30 seconds`,
      });

      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === value) {
            await navigator.clipboard.writeText("");
          }
        } catch {
          // Some browsers block clipboard read — silently skip
        }
        setCopied(false);
      }, CLEAR_TIMEOUT);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const masked = "•".repeat(Math.min(20, value?.length ?? 0));

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
        <span
          className={cn(
            "flex-1 truncate px-2 py-1 font-mono text-sm",
            !revealed && "tracking-wider text-muted-foreground"
          )}
        >
          {revealed ? value : masked}
        </span>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="grid h-7 w-7 place-items-center rounded text-muted-foreground transition hover:bg-accent hover:text-foreground"
          aria-label={revealed ? "Hide" : "Show"}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "grid h-7 w-7 place-items-center rounded transition",
            copied
              ? "bg-emerald-500/15 text-emerald-600"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}