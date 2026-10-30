"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deriveKey,
  wrapMasterKey,
  makeCheckValue,
  generateSalt,
  base64ToBytes,
  bytesToBase64,
  DEFAULT_KDF,
} from "@/modules/vault/crypto";
import { validatePassword, validatePin } from "@/modules/vault/lib/password-policy";
import { useVault } from "@/modules/vault/context/VaultContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, KeyRound } from "lucide-react";

export default function RecoverPage() {
  const router = useRouter();
  const { unlock } = useVault();

  const [step, setStep] = useState("verify"); // verify → otp → reset
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [masterKeyBase64, setMasterKeyBase64] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [busy, setBusy] = useState(false);

  // ── Resend timer ──
  const [resendCooldown, setResendCooldown] = useState(0);

  const startCooldown = (seconds = 90) => {
    setResendCooldown(seconds);
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

  const requestOtp = async (e) => {
    e?.preventDefault?.();
    setBusy(true);
    try {
      const res = await fetch("/api/vault/recovery/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, dob }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Code sent to your recovery email");
      setStep("otp");
      startCooldown(90);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    await requestOtp();
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/vault/recovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setMasterKeyBase64(json.masterKeyBase64);
      toast.success("Verified. Set your new credentials.");
      setStep("reset");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveNewCredentials = async (e) => {
    e.preventDefault();

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) return toast.error(pwCheck.message);
    if (newPassword !== confirmPw) return toast.error("Passwords don't match");
    const pinCheck = validatePin(newPin);
    if (!pinCheck.ok) return toast.error(pinCheck.message);
    if (newPin !== confirmPin) return toast.error("PINs don't match");

    setBusy(true);
    try {
      const masterKey = base64ToBytes(masterKeyBase64);
      // Single salt for both — ensures pinSalt === kdfSalt, avoiding the
      // drift problem we fixed earlier.
      const newSalt = generateSalt();

      const pwKey = await deriveKey(newPassword, newSalt, "password", DEFAULT_KDF);
      const wrappedPw = wrapMasterKey(masterKey, pwKey);

      const pinKey = await deriveKey(newPin, newSalt, "pin", DEFAULT_KDF);
      const wrappedPin = wrapMasterKey(masterKey, pinKey);

      const check = makeCheckValue(masterKey);
      const pinHash = await deriveKey(newPin, newSalt, "pin-hash", DEFAULT_KDF);

      const res = await fetch("/api/vault/recovery/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kdfSalt: newSalt,
          kdfAlgorithm: DEFAULT_KDF.algorithm,
          kdfParams: DEFAULT_KDF,
          wrappedByPassword: wrappedPw.ciphertext,
          wrappedByPasswordNonce: wrappedPw.nonce,
          wrappedByPin: wrappedPin.ciphertext,
          wrappedByPinNonce: wrappedPin.nonce,
          checkValue: check.ciphertext,
          checkNonce: check.nonce,
          pinHash: bytesToBase64(pinHash),
          pinSalt: newSalt,
          masterKeyBase64,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");

      unlock(masterKey);
      toast.success("Credentials reset. Welcome back.");
      router.replace("/vault");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    if (step === "otp") setStep("verify");
    else if (step === "reset") setStep("otp");
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recover vault</h1>
          <p className="text-sm text-muted-foreground">
            {step === "verify" && "Verify your identity to reset credentials."}
            {step === "otp" && "Enter the 6-digit code sent to your email."}
            {step === "reset" && "Set a new password and PIN."}
          </p>
        </div>
      </div>

      {step !== "verify" && (
        <button
          onClick={back}
          className="mb-3 flex w-fit items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" />
          Back
        </button>
      )}

      {step === "verify" && (
        <form onSubmit={requestOtp} className="space-y-3">
          <div>
            <label className="text-xs font-medium">Recovery email</label>
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
            <label className="text-xs font-medium">Date of birth</label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full" size="lg">
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="space-y-3">
          <Input
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="h-14 text-center text-3xl tracking-[0.5em]"
            autoFocus
            placeholder="••••••"
          />

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Didn't receive the code?
            </span>
            <button
              type="button"
              onClick={resendOtp}
              disabled={resendCooldown > 0 || busy}
              className="font-medium text-primary transition hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </div>

          <Button type="submit" disabled={busy} className="w-full" size="lg">
            {busy ? "Verifying…" : "Verify"}
          </Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={saveNewCredentials} className="space-y-3">
          <div>
            <label className="text-xs font-medium">New password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, 1 caps, 1 number"
              className="mt-1"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium">Confirm</label>
            <Input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium">New 6-digit PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-12 text-center text-2xl tracking-[0.5em]"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Confirm PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-12 text-center text-2xl tracking-[0.5em]"
            />
          </div>
          <Button type="submit" disabled={busy} className="w-full" size="lg">
            {busy ? "Saving…" : "Save new credentials"}
          </Button>
        </form>
      )}
    </div>
  );
}