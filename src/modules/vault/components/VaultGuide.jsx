"use client";

import { ShieldCheck, Lock, KeyRound, Fingerprint, AlertTriangle, BookOpen } from "lucide-react";
import { cn } from "@/core/utils/cn";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "What is this?",
    body: "Your personal password manager. Save credentials, cards, keys — everything encrypted on your device before it reaches us.",
  },
  {
    icon: Lock,
    title: "Zero-knowledge",
    body: "Your master password never leaves your device. We store only ciphertext. If you forget your password, your data can't be recovered without the recovery flow below.",
  },
  {
    icon: Fingerprint,
    title: "Two ways to unlock",
    body: "Use your master password for full security, or the 6-digit PIN for quick access. Both unlock the same vault.",
  },
  {
    icon: KeyRound,
    title: "What you can save",
    body: "Emails, banks, cards, social accounts, cloud keys, SSH keys, custom fields — anything with a secret.",
  },
  {
    icon: AlertTriangle,
    title: "Recovery",
    body: "If you forget your password, verify via email + DOB + OTP, then set a new password. Your saved items stay intact.",
  },
];

export default function VaultGuide({ compact = false }) {
  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="h-4 w-4 text-primary" />
          How your vault works
        </div>
      )}

      {STEPS.map((s) => (
        <div
          key={s.title}
          className="rounded-2xl border border-border/70 bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-magenta-500/10 text-primary">
              <s.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{s.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Encrypted means encrypted
            </div>
            <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
              What we see on our servers looks like this:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-2 font-mono text-[10px] text-amber-900/70 dark:bg-black/30 dark:text-amber-200/70">
{`{ ciphertext: "8fK3nX9pZ2...", nonce: "aB4v..." }`}
            </pre>
            <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-200/80">
              — not your actual password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}