"use client";

import { useState } from "react";
import { ShieldCheck, Mail, Calendar, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deriveKey, deriveItemKey, wrapMasterKey, makeCheckValue, encryptObject,
  encryptString, generateSalt, bytesToBase64, DEFAULT_KDF } from "@/modules/vault/crypto";
import { validatePassword, validateDob } from "@/modules/vault/lib/password-policy";
import SettingsModal from "./SettingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PasswordChangeModal({ open, onClose, settings, getMasterKey, items, onSuccess }) {
  const [step, setStep] = useState("verify"); // "verify" | "otp" | "reset" | "done"
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep("verify");
    setEmail("");
    setDob("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setBusy(false);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose?.();
  };

  // Step 1 — request OTP
  const requestOtp = async (e) => {
    e.preventDefault();
    const dobCheck = validateDob(dob);
    if (!dobCheck.ok) return toast.error(dobCheck.message);
    if (!email) return toast.error("Enter your recovery email");

    setBusy(true);
    try {
      const res = await fetch("/api/vault/change-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, dob }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("OTP sent — check your inbox");
      setStep("otp");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 2 — verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("OTP must be 6 digits");
    setBusy(true);
    try {
      const res = await fetch("/api/vault/change-password-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Verified");
      setStep("reset");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 3 — set new password
  const finalize = async (e) => {
  e.preventDefault();
  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.ok) return toast.error(pwCheck.message);
  if (newPassword !== confirmPassword) return toast.error("Passwords don't match");

  const masterKey = getMasterKey?.();
  if (!masterKey) return toast.error("Vault locked");

  setBusy(true);
  try {
    const newSalt = generateSalt();
    const newMasterKey = await deriveKey(
      newPassword,
      newSalt,
      "master",
      DEFAULT_KDF
    );
    const newMasterKeyB64 = bytesToBase64(newMasterKey);

    // New password wrap
    const newPwKey = await deriveKey(
      newPassword,
      newSalt,
      "password",
      DEFAULT_KDF
    );
    const wrappedPw = wrapMasterKey(newMasterKey, newPwKey);
    const check = makeCheckValue(newMasterKey);

    // ── ALSO re-wrap PIN with the new master key ──
    // The user's existing PIN stays the same, but the master key it wraps
    // is the new one, so PIN unlock keeps working after password change.
    const pinSalt = settings.pinSalt;
    // To re-wrap, we need the PIN. We don't have it here — the user hasn't
    // typed it in this flow. So we can't re-derive pinKey.
    //
    // Solution: mark PIN as "requires reset" so the client shows a banner.
    // The finalize route sets pinHash/wrappedByPin to null; the user is
    // asked to set a new PIN on next unlock.
    
    // Re-encrypt items
    const oldItemKey = deriveItemKey(masterKey);
    const newItemKey = deriveItemKey(newMasterKey);

    const reencryptedItems = items.map((item) => {
      const { ciphertext, nonce } = encryptObject(newItemKey, item.payload);
      const { ciphertext: labelCiphertext, nonce: labelNonce } = encryptString(
        newItemKey,
        item.label
      );
      return { id: item.id, ciphertext, nonce, labelCiphertext, labelNonce };
    });

    const res = await fetch("/api/vault/change-password-finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kdfSalt: newSalt,
        kdfAlgorithm: DEFAULT_KDF.algorithm,
        kdfParams: DEFAULT_KDF,
        wrappedByPassword: wrappedPw.ciphertext,
        wrappedByPasswordNonce: wrappedPw.nonce,
        checkValue: check.ciphertext,
        checkNonce: check.nonce,
        masterKeyBase64: newMasterKeyB64,
        reencryptedItems,
        // Signal: PIN must be re-set (server nulls it out)
        invalidatePin: true,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Failed");

    setStep("done");
    toast.success("Password changed. Your PIN is now disabled — please set a new one.", {
      duration: 6000,
    });
    setTimeout(() => {
      reset();
      onSuccess?.();
    }, 1400);
  } catch (err) {
    toast.error(err.message);
  } finally {
    setBusy(false);
  }
};

  const titleMap = {
    verify: "Change master password",
    otp: "Enter email OTP",
    reset: "Set new password",
    done: "Password changed",
  };
  const descMap = {
    verify: "Verify your recovery email and date of birth.",
    otp: `Enter the 6-digit code sent to ${email}`,
    reset: `All ${items.length} item${items.length === 1 ? "" : "s"} will be re-encrypted with the new key.`,
    done: "Re-unlocking the vault with your new password…",
  };

  const [resendCooldown, setResendCooldown] = useState(0);

const startCooldown = () => {
  setResendCooldown(90);
  const interval = setInterval(() => {
    setResendCooldown((s) => {
      if (s <= 1) {
        clearInterval(interval);
        return 0;
      }
      return s - 1;
    });
  }, 1000);
};

  return (
    <SettingsModal
      open={open}
      onClose={handleClose}
      title={titleMap[step]}
      description={descMap[step]}
      busy={busy}
      size="md"
      footer={
        step === "verify" ? (
          <>
            <Button variant="outline" onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={requestOtp} disabled={busy}>
              {busy ? "Sending…" : "Send OTP"}
            </Button>
          </>
        ) : step === "otp" ? (
          <>
            <Button
              variant="outline"
              onClick={() => setStep("verify")}
              disabled={busy}
            >
              Back
            </Button>
            <Button onClick={verifyOtp} disabled={busy || otp.length !== 6}>
              {busy ? "Verifying…" : "Verify"}
            </Button>
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Didn't receive it?</span>
                <button
                    type="button"
                    onClick={requestOtp}
                    disabled={resendCooldown > 0 || busy}
                    className="font-medium text-primary transition hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
            </div>
          </>
        ) : step === "reset" ? (
          <>
            <Button
              variant="outline"
              onClick={() => setStep("otp")}
              disabled={busy}
            >
              Back
            </Button>
            <Button onClick={finalize} disabled={busy}>
              {busy ? "Re-encrypting…" : "Change password"}
            </Button>
          </>
        ) : null
      }
    >
      {/* Step 1 — verify email + DOB */}
      {step === "verify" && (
        <form onSubmit={requestOtp} className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            We verify your identity via email OTP before letting you change the
            password.
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium">
              <Mail className="h-3 w-3" /> Recovery email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
              autoFocus
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium">
              <Calendar className="h-3 w-3" /> Date of birth
            </label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1"
            />
          </div>
        </form>
      )}

      {/* Step 2 — OTP */}
      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <div>
            <label className="text-xs font-medium">6-digit code</label>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="mt-1 h-14 text-center text-3xl tracking-[0.5em]"
              autoFocus
              autoComplete="one-time-code"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Sent to <strong>{email}</strong>. Valid for 10 minutes.
            </p>
          </div>
        </form>
      )}

      {/* Step 3 — new password */}
      {step === "reset" && (
        <form onSubmit={finalize} className="space-y-3">
          <div>
            <label className="text-xs font-medium">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className="mt-1"
              autoFocus
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Confirm password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1"
              autoComplete="new-password"
            />
          </div>
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-[11px] text-amber-700 dark:text-amber-300">
            All <strong>{items.length}</strong> item
            {items.length === 1 ? "" : "s"} will be re-encrypted. Keep this tab
            open — don't close it.
          </div>
        </form>
      )}

      {/* Step 4 — done */}
      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h4 className="mt-3 text-sm font-semibold">Password changed</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Re-locking your vault so you can unlock with the new password.
          </p>
        </div>
      )}
    </SettingsModal>
  );
}