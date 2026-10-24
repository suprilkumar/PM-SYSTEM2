"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, Lock, KeyRound, Mail, Calendar } from "lucide-react";
import {
  deriveKey,
  wrapMasterKey,
  makeCheckValue,
  generateSalt,
  randomBytes,
  bytesToBase64,
  DEFAULT_KDF,
} from "@/modules/vault/crypto";
import {
  validatePassword,
  validatePin,
  validateDob,
} from "@/modules/vault/lib/password-policy";
import { useVault } from "@/modules/vault/context/VaultContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import VaultGuide from "@/modules/vault/components/VaultGuide";
import { cn } from "@/core/utils/cn";

export default function SetupPage() {
  const router = useRouter();
  const { unlock } = useVault();

  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const pwCheck = validatePassword(password);
    if (!pwCheck.ok) return toast.error(pwCheck.message);
    if (password !== confirmPw) return toast.error("Passwords don't match");

    const pinCheck = validatePin(pin);
    if (!pinCheck.ok) return toast.error(pinCheck.message);
    if (pin !== confirmPin) return toast.error("PINs don't match");

    const dobCheck = validateDob(dob);
    if (!dobCheck.ok) return toast.error(dobCheck.message);
    if (!email) return toast.error("Recovery email is required");

    setBusy(true);
    try {
      const kdfSalt = generateSalt();
      const kdfParams = DEFAULT_KDF;

    console.log("[setup] kdfSalt:", kdfSalt.slice(0, 16));
    console.log("[setup] password length:", password.length);

      // Master key from password
      const masterKey = await deriveKey(password, kdfSalt, "master", kdfParams);
      const masterKeyB64 = bytesToBase64(masterKey);

      console.log("[setup] masterKey:", Array.from(masterKey.slice(0, 8)));
    console.log("[setup] masterKeyB64:", masterKeyB64.slice(0, 16));

      // Wrap with password-derived key
      const pwKey = await deriveKey(password, kdfSalt, "password", kdfParams);

      console.log("[setup] pwKey:", Array.from(pwKey.slice(0, 8)));

      const wrappedPw = wrapMasterKey(masterKey, pwKey);

      console.log("[setup] wrappedByPassword:", wrappedPw.ciphertext.slice(0, 20) + "...");
console.log("[setup] wrappedByPasswordNonce:", wrappedPw.nonce.slice(0, 20) + "...");

      // Wrap with PIN-derived key
      const pinKey = await deriveKey(pin, kdfSalt, "pin", kdfParams);
      const wrappedPin = wrapMasterKey(masterKey, pinKey);

      // Check value + PIN hash for server-side rate limiting
      const check = makeCheckValue(masterKey);
      const pinHash = await deriveKey(pin, kdfSalt, "pin-hash", kdfParams);

      const res = await fetch("/api/vault/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kdfSalt,
          kdfAlgorithm: kdfParams.algorithm,
          kdfParams,
          wrappedByPassword: wrappedPw.ciphertext,
          wrappedByPasswordNonce: wrappedPw.nonce,
          wrappedByPin: wrappedPin.ciphertext,
          wrappedByPinNonce: wrappedPin.nonce,
          wrappedAlgorithm: wrappedPw.algorithm,
          checkValue: check.ciphertext,
          checkNonce: check.nonce,
          pinHash: bytesToBase64(pinHash),
          pinSalt: kdfSalt,
          recoveryEmail: email,
          recoveryDob: new Date(dob).toISOString(),
          masterKeyBase64: masterKeyB64,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Setup failed");

      unlock(masterKey);

      // Mark PIN verified for immediate access
      await fetch("/api/vault/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      toast.success("Vault created");
      router.replace("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: form */}
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create your vault</h1>
              <p className="text-sm text-muted-foreground">
                End-to-end encrypted. We can't read what you save.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            {/* Password */}
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Lock className="h-4 w-4 text-primary" />
                Master password
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="mt-1"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Confirm password</label>
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* PIN */}
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="h-4 w-4 text-primary" />
                Quick unlock PIN
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">6-digit PIN</label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 h-12 text-center text-2xl tracking-[0.5em]"
                    placeholder="••••••"
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
              </div>
            </div>

            {/* Recovery */}
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Mail className="h-4 w-4 text-primary" />
                Account recovery
              </div>
              <p className="mb-3 text-xs text-muted-foreground">
                Used only if you forget your password. We'll send an OTP to this email.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium">Your sign-in email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
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
              </div>
            </div>

            <Button type="submit" disabled={busy} size="lg" className="w-full">
              {busy ? "Creating vault…" : "Create vault"}
            </Button>
          </form>
        </div>

        {/* Right: guide */}
        <div>
          <VaultGuide />
        </div>
      </div>
    </div>
  );
}