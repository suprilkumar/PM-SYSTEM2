"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { Lock, KeyRound, ShieldCheck, AlertTriangle } from "lucide-react";
import { useVaultUnlock } from "@/modules/vault/hooks/useVaultUnlock";
import {
  deriveKey,
  wrapMasterKey,
  bytesToBase64,
  DEFAULT_KDF,
} from "@/modules/vault/crypto";
import { validatePin } from "@/modules/vault/lib/password-policy";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";
import { useVault } from "@/modules/vault/context/VaultContext";

export default function UnlockPage() {
  const router = useRouter();
  const { data: settings, isLoading } = useSWR("/api/vault/settings");
  const { unlockWithPin, unlockWithPassword } = useVaultUnlock();

  const [mode, setMode] = useState("pin");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // When hasPin is false, force password unlock first, then prompt for PIN
  const needsPinSetup = settings?.hasPin === false;
  const [setupPinMode, setSetupPinMode] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");

  const { getMasterKey } = useVault();
  
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

      // If PIN is missing, prompt to set it
      if (needsPinSetup) {
        setSetupPinMode(true);
        toast.success("Password verified. Set a new PIN.");
        return;
      }

      toast.success("Vault unlocked");
      router.replace("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveNewPin = async (e) => {
  e.preventDefault();
  const pinCheck = validatePin(newPin);
  if (!pinCheck.ok) return toast.error(pinCheck.message);
  if (newPin !== newPinConfirm) return toast.error("PINs don't match");

  const masterKey = getMasterKey();
  if (!masterKey) return toast.error("Vault locked — unlock with password first");

  setBusy(true);
  try {
    // Use the ORIGINAL salt (kdfSalt) — since the PIN was invalidated, we
    // can reuse the vault's kdfSalt (it's stable per vault).
    const pinSalt = settings.kdfSalt;
    const pinKey = await deriveKey(newPin, pinSalt, "pin", settings.kdfParams);
    const wrappedPin = wrapMasterKey(masterKey, pinKey);
    const pinHash = await deriveKey(
      newPin,
      pinSalt,
      "pin-hash",
      settings.kdfParams
    );

    const res = await fetch("/api/vault/change-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pinHash: bytesToBase64(pinHash),
        pinSalt,
        wrappedByPin: wrappedPin.ciphertext,
        wrappedByPinNonce: wrappedPin.nonce,
      }),
    });
    if (!res.ok) throw new Error("Failed to save PIN");

    toast.success("PIN saved");
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

  // If needsPinSetup and user hasn't unlocked yet, force password tab
  const forcedPasswordMode = needsPinSetup && !setupPinMode;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {setupPinMode ? "Set a new PIN" : "Unlock vault"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {setupPinMode
              ? "Your PIN was cleared after the password change."
              : forcedPasswordMode
              ? "Your PIN is disabled. Unlock with password to continue."
              : "Choose PIN or password to unlock"}
          </p>
        </div>
      </div>

      {forcedPasswordMode && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            After your recent password change, your PIN was disabled. Enter your
            password once, then set a new PIN.
          </span>
        </div>
      )}

      {/* Tabs — hidden while setupPinMode is active or PIN is missing */}
      {!setupPinMode && !needsPinSetup && (
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
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Setup-new-PIN step (only after password unlock when PIN missing) */}
      {setupPinMode ? (
        <form onSubmit={saveNewPin} className="space-y-4">
          <div>
            <label className="text-xs font-medium">New 6-digit PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-16 text-center text-4xl tracking-[0.5em]"
              autoFocus
              placeholder="••••••"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Confirm PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPinConfirm}
              onChange={(e) => setNewPinConfirm(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-16 text-center text-4xl tracking-[0.5em]"
              placeholder="••••••"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full" size="lg">
            {busy ? "Saving…" : "Save new PIN"}
          </Button>
        </form>
      ) : forcedPasswordMode || mode === "password" ? (
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
      ) : (
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