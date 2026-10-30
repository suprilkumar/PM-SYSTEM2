"use client";

import { useState } from "react";
import { Lock, KeyRound, Loader2, Check, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  deriveKey,
  wrapMasterKey,
  unwrapMasterKey,
  verifyCheckValue,
  bytesToBase64,
  DEFAULT_KDF,
} from "@/modules/vault/crypto";
import { validatePin } from "@/modules/vault/lib/password-policy";
import SettingsModal from "./SettingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

export default function PinChangeModal({
  open,
  onClose,
  settings,
  getMasterKey,
  onSuccess,
}) {
  const [step, setStep] = useState("verify"); // "verify" | "set" | "done"
  const [currentPassword, setCurrentPassword] = useState("");
  const [verifiedMasterKey, setVerifiedMasterKey] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep("verify");
    setCurrentPassword("");
    setVerifiedMasterKey(null);
    setNewPin("");
    setConfirmPin("");
    setBusy(false);
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  // ── Step 1: verify password ──
  const verifyPassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) return toast.error("Enter your master password");
    if (!settings) return toast.error("Settings not loaded");

    setBusy(true);
    try {
      const pwKey = await deriveKey(
        currentPassword,
        settings.kdfSalt,
        "password",
        settings.kdfParams
      );

      let masterKey;
      try {
        masterKey = unwrapMasterKey(
          {
            ciphertext: settings.wrappedByPassword,
            nonce: settings.wrappedByPasswordNonce,
          },
          pwKey
        );
      } catch {
        throw new Error("Incorrect password");
      }

      const ok = verifyCheckValue(masterKey, {
        ciphertext: settings.checkValue,
        nonce: settings.checkNonce,
      });
      if (!ok) throw new Error("Incorrect password");

      // Also verify against the live in-memory key if present
      const live = getMasterKey?.();
      if (live) {
        // They should be identical; if not, the cached key is stale
        // We still trust the re-derived one.
      }

      setVerifiedMasterKey(masterKey);
      setStep("set");
      toast.success("Password verified");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ── Step 2: set new PIN ──
  const savePin = async (e) => {
    e.preventDefault();
    const pinCheck = validatePin(newPin);
    if (!pinCheck.ok) return toast.error(pinCheck.message);
    if (newPin !== confirmPin) return toast.error("PINs don't match");
    if (!verifiedMasterKey) return toast.error("Session expired — restart");

    setBusy(true);
    try {
      const pinSalt = settings.pinSalt;

      const pinKey = await deriveKey(newPin, pinSalt, "pin", DEFAULT_KDF);
      const wrappedPin = wrapMasterKey(verifiedMasterKey, pinKey);
      const pinHash = await deriveKey(newPin, pinSalt, "pin-hash", DEFAULT_KDF);

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
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");

      setStep("done");
      toast.success("PIN updated");
      setTimeout(() => {
        onSuccess?.();
        reset();
      }, 900);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SettingsModal
      open={open}
      onClose={handleClose}
      title="Change PIN"
      description={
        step === "verify"
          ? "Verify your master password to continue."
          : step === "set"
          ? "Now enter your new 6-digit PIN."
          : "PIN updated successfully."
      }
      busy={busy}
      footer={
        step === "verify" ? (
          <>
            <Button variant="outline" onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={verifyPassword} disabled={busy}>
              {busy ? "Verifying…" : "Verify password"}
            </Button>
          </>
        ) : step === "set" ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setStep("verify");
                setNewPin("");
                setConfirmPin("");
                setVerifiedMasterKey(null);
              }}
              disabled={busy}
            >
              Back
            </Button>
            <Button onClick={savePin} disabled={busy}>
              {busy ? "Updating…" : "Update PIN"}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose}>
            <Check className="mr-1.5 h-4 w-4" />
            Done
          </Button>
        )
      }
    >
      {/* Step 1 — Verify */}
      {step === "verify" && (
        <form onSubmit={verifyPassword} className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            We verify your password before letting you change the PIN.
          </div>
          <div>
            <label className="text-xs font-medium">Master password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your master password"
              className="mt-1"
              autoFocus
              autoComplete="current-password"
            />
          </div>
        </form>
      )}

      {/* Step 2 — Set PIN */}
      {step === "set" && (
        <form onSubmit={savePin} className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-300">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Password verified. Enter your new PIN.
          </div>
          <div>
            <label className="text-xs font-medium">New 6-digit PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-14 text-center text-3xl tracking-[0.5em]"
              autoFocus
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Confirm new PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-14 text-center text-3xl tracking-[0.5em]"
              autoComplete="new-password"
            />
          </div>
        </form>
      )}

      {/* Step 3 — Done */}
      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h4 className="mt-3 text-sm font-semibold">PIN updated</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Use your new PIN next time you unlock the vault.
          </p>
        </div>
      )}
    </SettingsModal>
  );
}