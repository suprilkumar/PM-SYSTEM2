"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useVault } from "../context/VaultContext";
import { cn } from "@/core/utils/cn";

export default function VaultAutoLockTimer() {
  const { isUnlocked, expiresAt } = useVault();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!isUnlocked || !expiresAt) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const ms = Math.max(0, expiresAt - Date.now());
      setRemaining(Math.ceil(ms / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked, expiresAt]);

  if (!isUnlocked || remaining <= 0) return null;

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const isWarning = remaining < 60;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        isWarning
          ? "border-amber-500/40 bg-amber-500/10 text-amber-600"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
      title="Vault auto-locks after inactivity"
    >
      {isWarning ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      <span className="tabular-nums">
        {isWarning ? "Locks in " : "Auto-lock "}
        {mm > 0 ? `${mm}m ` : ""}
        {String(ss).padStart(2, "0")}s
      </span>
    </div>
  );
}