"use client";

import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";
import SettingsModal from "./SettingsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeleteVaultModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState("confirm"); // "confirm" | "done"
  const [deletePin, setDeletePin] = useState("");
  const [deleteText, setDeleteText] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep("confirm");
    setDeletePin("");
    setDeleteText("");
    setBusy(false);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose?.();
  };

  const confirmDelete = async () => {
    if (deletePin.length !== 6) return toast.error("Enter your 6-digit PIN");
    if (deleteText !== "DELETE MY VAULT") {
      return toast.error('Type "DELETE MY VAULT" to confirm');
    }
    setBusy(true);
    try {
      const res = await fetch("/api/vault/delete-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText: deleteText, pin: deletePin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      toast.success("Vault deleted");
      setStep("done");
      setTimeout(() => {
        reset();
        onSuccess?.();
      }, 1200);
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
      title={step === "confirm" ? "Delete your vault?" : "Vault deleted"}
      description={
        step === "confirm"
          ? "This permanently removes everything. Cannot be undone."
          : "You'll be redirected to start fresh."
      }
      busy={busy}
      size="md"
      footer={
        step === "confirm" ? (
          <>
            <Button variant="outline" onClick={handleClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={
                busy ||
                deletePin.length !== 6 ||
                deleteText !== "DELETE MY VAULT"
              }
            >
              {busy ? "Deleting…" : "Delete everything"}
            </Button>
          </>
        ) : null
      }
    >
      {step === "confirm" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="text-xs">
              <div className="font-semibold text-destructive">
                All vault items will be permanently erased
              </div>
              <div className="mt-1 text-muted-foreground">
                Your account remains, but the vault becomes empty. You can set
                it up again from scratch.
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">
              PIN (final verification)
            </label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={deletePin}
              onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, ""))}
              className="mt-1 h-12 text-center text-2xl tracking-[0.5em]"
              placeholder="••••••"
            />
          </div>

          <div>
            <label className="text-xs font-medium">
              Type{" "}
              <span className="font-mono text-destructive">
                DELETE MY VAULT
              </span>{" "}
              to confirm
            </label>
            <Input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="DELETE MY VAULT"
              className="mt-1 font-mono"
            />
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h4 className="mt-3 text-sm font-semibold">Vault deleted</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Everything has been wiped. You'll be redirected to set up a new
            vault.
          </p>
        </div>
      )}
    </SettingsModal>
  );
}