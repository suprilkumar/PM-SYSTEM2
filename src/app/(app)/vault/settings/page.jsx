"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, AlertTriangle, Lock, Mail, Calendar } from "lucide-react";
import { useVault } from "@/modules/vault/context/VaultContext";
import { useVaultItems } from "@/modules/vault/hooks/useVaultItems";
import { deriveKey, deriveItemKey, wrapMasterKey, unwrapMasterKey, verifyCheckValue, makeCheckValue, encryptObject,
  encryptString, generateSalt, bytesToBase64, DEFAULT_KDF } from "@/modules/vault/crypto";
import { validatePassword, validatePin, validateDob} from "@/modules/vault/lib/password-policy";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

export default function VaultSettingsPage() {
  const router = useRouter();
  const { getMasterKey, lock } = useVault();
  const { data: settings, mutate: reloadSettings } = useSWR("/api/vault/settings");
  const { items, reload: reloadItems } = useVaultItems();

  const [tab, setTab] = useState("pin");

  // ── Change PIN state ──
  const [currentPwForPin, setCurrentPwForPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  // ── Change password state ──
  const [passwordStep, setPasswordStep] = useState("dob"); // dob → otp → reset
  const [dob, setDob] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  // ── Delete state ──
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePin, setDeletePin] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* ═════════ Change PIN ═════════ */

const changePin = async (e) => {
  e.preventDefault();
  const pinCheck = validatePin(newPin);
  if (!pinCheck.ok) return toast.error(pinCheck.message);
  if (newPin !== confirmPin) return toast.error("PINs don't match");
  if (!currentPwForPin) return toast.error("Enter your master password");

  const masterKey = getMasterKey();
  if (!masterKey) return toast.error("Vault locked");

  setPinBusy(true);
  try {
    // 1. Verify the entered password
    const pwKey = await deriveKey(
      currentPwForPin,
      settings.kdfSalt,
      "password",
      settings.kdfParams
    );
    let unwrapped;
    try {
      unwrapped = unwrapMasterKey(
        {
          ciphertext: settings.wrappedByPassword,
          nonce: settings.wrappedByPasswordNonce,
        },
        pwKey
      );
    } catch {
      throw new Error("Incorrect password");
    }
    const matches = verifyCheckValue(unwrapped, {
      ciphertext: settings.checkValue,
      nonce: settings.checkNonce,
    });
    if (!matches) throw new Error("Incorrect password");

    // 2. Reuse the EXISTING pinSalt — never regenerate.
    //    The salt is per-vault, not per-PIN.
    const pinSalt = settings.pinSalt;

    const pinKey = await deriveKey(newPin, pinSalt, "pin", DEFAULT_KDF);
    const wrappedPin = wrapMasterKey(unwrapped, pinKey);
    const pinHash = await deriveKey(newPin, pinSalt, "pin-hash", DEFAULT_KDF);

    const pinHashB64 = bytesToBase64(pinHash);

if (!pinHashB64 || pinHashB64.length < 20) {
  console.error("[changePin] pinHash is bad:", pinHashB64);
  throw new Error("Failed to compute PIN hash");
}
if (!pinSalt || pinSalt.length < 10) {
  console.error("[changePin] pinSalt is bad:", pinSalt);
  throw new Error("Missing PIN salt — reload the page");
}
if (!wrappedPin?.ciphertext) {
  console.error("[changePin] wrappedPin is bad:", wrappedPin);
  throw new Error("Failed to wrap master key");
}
if (!wrappedPin?.nonce) {
  throw new Error("Failed to generate wrap nonce");
}

    // 3. Persist — pinSalt is passed unchanged
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

    toast.success("PIN updated");
    setCurrentPwForPin("");
    setNewPin("");
    setConfirmPin("");
    await reloadSettings();
  } catch (err) {
    toast.error(err.message);
  } finally {
    setPinBusy(false);
  }
};

  /* ═════════ Change password ═════════ */

  const requestPasswordOtp = async (e) => {
    e.preventDefault();
    const dobCheck = validateDob(dob);
    if (!dobCheck.ok) return toast.error(dobCheck.message);

    setPasswordBusy(true);
    try {
      const res = await fetch("/api/vault/change-password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dob }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("OTP sent to your recovery email");
      setPasswordStep("otp");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordBusy(false);
    }
  };

  const verifyPasswordOtp = async (e) => {
    e.preventDefault();
    setPasswordBusy(true);
    try {
      const res = await fetch("/api/vault/change-password-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Verified. Set new password.");
      setPasswordStep("reset");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordBusy(false);
    }
  };

  const finalizePasswordChange = async (e) => {
    e.preventDefault();
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.ok) return toast.error(pwCheck.message);
    if (newPassword !== confirmPassword) return toast.error("Passwords don't match");

    const masterKey = getMasterKey();
    if (!masterKey) return toast.error("Vault locked");

    setPasswordBusy(true);
    try {
      const newSalt = generateSalt();
      const newMasterKey = await deriveKey(newPassword, newSalt, "master", DEFAULT_KDF);
      const newMasterKeyB64 = bytesToBase64(newMasterKey);

      const newPwKey = await deriveKey(newPassword, newSalt, "password", DEFAULT_KDF);
      const wrappedPw = wrapMasterKey(newMasterKey, newPwKey);

      const check = makeCheckValue(newMasterKey);

      // Re-encrypt all items with the new master key
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
          // Keep the current PIN wrap unchanged — user can change PIN separately
          pinHash: settings.pinHash, // need to fetch from server
          pinSalt: settings.pinSalt,
          wrappedByPin: settings.wrappedByPin,
          wrappedByPinNonce: settings.wrappedByPinNonce,
          masterKeyBase64: newMasterKeyB64,
          reencryptedItems,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");

      // Re-unlock with the new key so the session stays consistent
      // (or force logout)
      toast.success("Password changed. Please unlock again.");
      await lock("password-changed");
      router.replace("/vault/unlock");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordBusy(false);
    }
  };

  /* ═════════ Delete all ═════════ */

  const deleteAll = async () => {
    if (!deletePin) return toast.error("Enter your PIN");
    if (deleteText !== "DELETE MY VAULT") {
      return toast.error('Type "DELETE MY VAULT" to confirm');
    }

    setDeleteBusy(true);
    try {
      const res = await fetch("/api/vault/delete-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText: deleteText, pin: deletePin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Vault deleted");
      router.push("/vault");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <PageHeader
        title="Vault settings"
        description="Manage your PIN, password, and vault data"
        breadcrumbs={[
          { label: "Vault", href: "/vault" },
          { label: "Settings" },
        ]}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border bg-background p-1">
        {[
          { v: "pin", icon: KeyRound, label: "Change PIN" },
          { v: "password", icon: ShieldCheck, label: "Change password" },
          { v: "danger", icon: AlertTriangle, label: "Danger zone" },
        ].map(({ v, icon: Icon, label }) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition",
              tab === v
                ? v === "danger"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "bg-gradient-to-r from-primary to-magenta-500 text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ═════════ Change PIN ═════════ */}
      {tab === "pin" && (
        <form onSubmit={changePin} className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Change PIN</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Verify your master password, then set a new 6-digit PIN.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium">Current master password</label>
            <Input
              type="password"
              value={currentPwForPin}
              onChange={(e) => setCurrentPwForPin(e.target.value)}
              placeholder="Required to verify identity"
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
            <label className="text-xs font-medium">Confirm new PIN</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-12 text-center text-2xl tracking-[0.5em]"
            />
          </div>

          <Button type="submit" disabled={pinBusy} className="w-full">
            {pinBusy ? "Updating…" : "Update PIN"}
          </Button>
        </form>
      )}

      {/* ═════════ Change password ═════════ */}
      {tab === "password" && (
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Change master password</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Verify your date of birth and email OTP. All items will be re-encrypted.
            </p>
          </div>

          {passwordStep === "dob" && (
            <form onSubmit={requestPasswordOtp} className="space-y-3">
              <div>
                <label className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Date of birth
                </label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="mt-1"
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Must match the DOB you entered during setup
                </p>
              </div>
              <Button type="submit" disabled={passwordBusy} className="w-full">
                {passwordBusy ? "Sending…" : "Send OTP to email"}
              </Button>
            </form>
          )}

          {passwordStep === "otp" && (
            <form onSubmit={verifyPasswordOtp} className="space-y-3">
              <div>
                <label className="text-xs font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" /> OTP sent to {settings?.recoveryEmail}
                </label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="mt-1 h-14 text-center text-3xl tracking-[0.5em]"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordStep("dob")}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={passwordBusy} className="flex-1">
                  {passwordBusy ? "Verifying…" : "Verify"}
                </Button>
              </div>
            </form>
          )}

          {passwordStep === "reset" && (
            <form onSubmit={finalizePasswordChange} className="space-y-3">
              <div>
                <label className="text-xs font-medium">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8, 1 uppercase, 1 number"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Confirm</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-2 text-[10px] text-amber-700 dark:text-amber-300">
                All {items.length} item{items.length === 1 ? "" : "s"} will be re-encrypted. Keep this tab open — don't close it during the process.
              </p>
              <Button type="submit" disabled={passwordBusy} className="w-full">
                {passwordBusy ? "Re-encrypting…" : "Change password"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ═════════ Danger zone ═════════ */}
      {tab === "danger" && (
        <div className="space-y-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Delete entire vault</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              This permanently removes all saved items, settings, and recovery
              data. Your account remains, but the vault becomes empty.
              <strong className="block mt-1 text-destructive">This cannot be undone.</strong>
            </p>
          </div>

          <div>
            <label className="text-xs font-medium">Your PIN (final verification)</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={deletePin}
              onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-12 text-center text-2xl tracking-[0.5em]"
            />
          </div>

          <div>
            <label className="text-xs font-medium">
              Type <span className="font-mono">DELETE MY VAULT</span> to confirm
            </label>
            <Input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE MY VAULT"
              className="mt-1 font-mono"
            />
          </div>

          <Button
            onClick={() => setDeleteConfirm(true)}
            disabled={
              deleteBusy ||
              deleteText !== "DELETE MY VAULT" ||
              deletePin.length !== 6
            }
            variant="destructive"
            className="w-full"
          >
            Delete all vault data
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={deleteAll}
        loading={deleteBusy}
        title="Delete your entire vault?"
        description="All saved items, recovery codes, and settings will be permanently removed. This cannot be undone. Are you absolutely sure?"
        confirmLabel="Yes, delete everything"
      />
    </div>
  );
}