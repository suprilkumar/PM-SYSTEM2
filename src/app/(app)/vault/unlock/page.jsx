"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { Lock, KeyRound, ShieldCheck } from "lucide-react";
import { useVaultUnlock } from "@/modules/vault/hooks/useVaultUnlock";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export default function UnlockPage() {
  const router = useRouter();
  const { data: settings, isLoading } = useSWR("/api/vault/settings");
  const { unlockWithPin, unlockWithPassword } = useVaultUnlock();

  const [mode, setMode] = useState("pin");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submitPin = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) return toast.error("PIN must be 6 digits");
    setBusy(true);
    try {
      const res = await fetch("/api/vault/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "PIN rejected");

      await unlockWithPin({ pin, settings });
      toast.success("Vault unlocked");
      router.replace("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (!password) return toast.error("Enter your password");
    setBusy(true);
    try {
      await unlockWithPassword({ password, settings });
      await fetch("/api/vault/confirm-unlock", { method: "POST" });
      toast.success("Vault unlocked");
      router.replace("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!settings?.configured) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-muted-foreground">Vault not set up</p>
        <Button onClick={() => router.push("/vault/setup")} className="mt-3">
          Set up vault
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Unlock vault</h1>
          <p className="text-sm text-muted-foreground">
            Choose PIN or password to unlock
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border bg-background p-1">
        {[
          { v: "pin", icon: KeyRound, label: "PIN" },
          { v: "password", icon: ShieldCheck, label: "Password" },
        ].map(({ v, icon: Icon, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => setMode(v)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
              mode === v
                ? "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "pin" && (
        <form onSubmit={submitPin} className="space-y-4">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="h-16 text-center text-4xl tracking-[0.5em]"
            autoFocus
          />
          <Button
            type="submit"
            disabled={busy || pin.length !== 6}
            className="w-full"
            size="lg"
          >
            {busy ? "Unlocking…" : "Unlock with PIN"}
          </Button>
        </form>
      )}

      {mode === "password" && (
        <form onSubmit={submitPassword} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Master password"
            className="h-12"
            autoFocus
          />
          <Button
            type="submit"
            disabled={busy || !password}
            className="w-full"
            size="lg"
          >
            {busy ? "Unlocking…" : "Unlock with password"}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <a
          href="/vault/recover"
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Forgot your PIN or password? Recover account →
        </a>
      </div>
    </div>
  );
}