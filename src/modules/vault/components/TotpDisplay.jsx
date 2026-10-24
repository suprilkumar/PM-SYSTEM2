"use client";

import { useEffect, useState } from "react";
import { generateSync } from "otplib";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/core/utils/cn";

export default function TotpDisplay({ secret }) {
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(30);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!secret) return;

    const generate = () => {
      try {
        const cleaned = secret.replace(/\s/g, "");
        const c = generateSync({ secret: cleaned });
        setCode(c);
        setError(null);
      } catch (err) {
        setCode("------");
        setError(err.message);
      }
      setRemaining(30 - (Math.floor(Date.now() / 1000) % 30));
    };

    generate();
    const interval = setInterval(generate, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const pct = (remaining / 30) * 100;

  if (error) {
    return (
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          TOTP code
        </label>
        <p className="mt-1 text-xs text-destructive">
          Invalid TOTP secret: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">
        TOTP code
      </label>
      <div className="relative overflow-hidden rounded-lg border bg-background">
        <div className="flex items-center justify-between p-2">
          <span className="font-mono text-xl font-bold tracking-[0.3em] tabular-nums">
            {code.slice(0, 3)} {code.slice(3)}
          </span>
          <button
            onClick={copy}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md transition",
              copied
                ? "bg-emerald-500/15 text-emerald-600"
                : "text-muted-foreground hover:bg-accent"
            )}
            aria-label="Copy code"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="h-1 bg-muted">
          <div
            className={cn(
              "h-full transition-all",
              remaining > 10
                ? "bg-emerald-500"
                : remaining > 5
                ? "bg-amber-500"
                : "bg-red-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Refreshes in {remaining}s
      </p>
    </div>
  );
}