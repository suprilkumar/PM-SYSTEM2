// src/app/(app)/vault/setup/page.jsx
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck, Lock, KeyRound, Mail, Calendar as CalendarIcon,
  Eye, EyeOff, Check, X, ChevronLeft, ChevronRight,
  AlertCircle, Sparkles, Fingerprint,
} from "lucide-react";
import {
  deriveKey, wrapMasterKey, makeCheckValue, generateSalt, randomBytes,
  bytesToBase64, DEFAULT_KDF, base64ToBytes,
} from "@/modules/vault/crypto";
import {
  validatePassword, validatePin, validateDob,
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

  // Visibility toggles
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Derived match states
  const pwMatch = confirmPw.length > 0 && password === confirmPw;
  const pwMismatch = confirmPw.length > 0 && password !== confirmPw;
  const pinMatch = confirmPin.length === 6 && pin === confirmPin;
  const pinMismatch = confirmPin.length === 6 && pin !== confirmPin;

  const pwChecks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

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

      const masterKey = await deriveKey(password, kdfSalt, "master", kdfParams);
      const masterKeyB64 = bytesToBase64(masterKey);

      const pwKey = await deriveKey(password, kdfSalt, "password", kdfParams);
      const wrappedPw = wrapMasterKey(masterKey, pwKey);

      const pinKey = await deriveKey(pin, kdfSalt, "pin", kdfParams);
      const wrappedPin = wrapMasterKey(masterKey, pinKey);

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
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ── Left: form ── */}
        <div className="space-y-6">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-magenta-500/5 to-transparent p-5 md:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg shadow-primary/25">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/70 px-2.5 py-0.5 text-[11px] font-medium text-primary backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  Zero-knowledge
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                  Create your vault
                </h1>
                <p className="text-sm text-muted-foreground">
                  End-to-end encrypted. We can't read what you save.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* ── Password ── */}
            <FormSection icon={Lock} title="Master password" subtitle="Encrypts everything you save">
              <div className="space-y-3">
                <Field label="Password" hint="Min 8 chars">
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="h-11 pr-10"
                      autoFocus
                    />
                    <EyeToggle shown={showPw} onToggle={() => setShowPw((v) => !v)} />
                  </div>
                </Field>

                {/* Strength checklist */}
                {password.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-lg bg-muted/40 p-3 text-[11px]">
                    <CheckItem ok={pwChecks.length} label="8+ characters" />
                    <CheckItem ok={pwChecks.upper} label="Uppercase letter" />
                    <CheckItem ok={pwChecks.lower} label="Lowercase letter" />
                    <CheckItem ok={pwChecks.digit} label="Number" />
                    <CheckItem ok={pwChecks.special} label="Special char" />
                  </div>
                )}

                <Field label="Confirm password">
                  <div className="relative">
                    <Input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Re-enter password"
                      className={cn(
                        "h-11 pr-16 transition-colors",
                        pwMatch && "border-emerald-500/60 focus-visible:ring-emerald-500/30",
                        pwMismatch && "border-destructive/60 focus-visible:ring-destructive/30"
                      )}
                    />
                    <MatchIndicator match={pwMatch} mismatch={pwMismatch} />
                    <EyeToggle
                      shown={showConfirmPw}
                      onToggle={() => setShowConfirmPw((v) => !v)}
                      right="pr-10"
                    />
                  </div>
                  <MatchHint match={pwMatch} mismatch={pwMismatch} />
                </Field>
              </div>
            </FormSection>

            {/* ── PIN ── */}
            <FormSection icon={KeyRound} title="Quick unlock PIN" subtitle="6-digit code for fast access">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      PIN
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Fingerprint className="h-3 w-3" />
                      {pin.length}/6
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <OtpInput
                      value={pin}
                      onChange={(v) => setPin(v)}
                      show={showPin}
                      autoFocus={false}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin((v) => !v)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      aria-label={showPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">
                      Confirm PIN
                    </label>
                    {pinMatch && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                        Match
                      </span>
                    )}
                    {pinMismatch && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                        <X className="h-3 w-3" />
                        Doesn't match
                      </span>
                    )}
                  </div>
                  <OtpInput
                    value={confirmPin}
                    onChange={(v) => setConfirmPin(v)}
                    show={showPin}
                    match={pinMatch}
                    mismatch={pinMismatch}
                  />
                </div>
              </div>
            </FormSection>

            {/* ── Recovery ── */}
            <FormSection icon={Mail} title="Account recovery" subtitle="Used only if you forget your password">
              <div className="space-y-3">
                <Field label="Recovery email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Recovery OTPs are sent here if you forget your password.
                  </p>
                </Field>
                <Field label="Date of birth">
                  <ModernDatePicker value={dob} onChange={setDob} />
                </Field>
              </div>
            </FormSection>

            <Button
              type="submit"
              disabled={busy}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-primary to-magenta-500 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Creating vault…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Create vault
                </>
              )}
            </Button>
          </form>
        </div>

        {/* ── Right: guide ── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <VaultGuide />
        </div>
      </div>
    </div>
  );
}

/* ─────────── Sub-components ─────────── */

function FormSection({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && (
            <div className="text-[11px] text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {hint && <span className="text-[11px] text-muted-foreground/70">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CheckItem({ ok, label }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border transition-all",
          ok
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-muted-foreground/30 bg-transparent"
        )}
      >
        {ok && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {label}
    </div>
  );
}

function EyeToggle({ shown, onToggle, right = "right-2" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "absolute top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground",
        right
      )}
      aria-label={shown ? "Hide" : "Show"}
    >
      {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function MatchIndicator({ match, mismatch }) {
  if (!match && !mismatch) return null;
  return (
    <span
      className={cn(
        "absolute right-10 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full",
        match && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        mismatch && "bg-destructive/15 text-destructive"
      )}
    >
      {match ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}

function MatchHint({ match, mismatch }) {
  if (!match && !mismatch) return null;
  return (
    <p
      className={cn(
        "mt-1.5 flex items-center gap-1 text-[11px] font-medium",
        match && "text-emerald-600 dark:text-emerald-400",
        mismatch && "text-destructive"
      )}
    >
      {match ? (
        <>
          <Check className="h-3 w-3" /> Passwords match
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3" /> Passwords don't match
        </>
      )}
    </p>
  );
}

/* ─────────── OTP Input (6 boxes) ─────────── */

function OtpInput({ value, onChange, show = true, match, mismatch, autoFocus }) {
  const inputsRef = useRef([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const setDigit = (i, char) => {
    const next = digits.slice();
    next[i] = char || " ";
    onChange(next.join("").trimEnd());
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigit(i, "");
      return;
    }
    // If user pasted multiple digits, spread them
    if (raw.length > 1) {
      const chars = raw.slice(0, 6 - i).split("");
      const next = digits.slice();
      chars.forEach((c, idx) => { if (i + idx < 6) next[i + idx] = c; });
      onChange(next.join("").trimEnd());
      const last = Math.min(i + chars.length, 5);
      inputsRef.current[last]?.focus();
      return;
    }
    setDigit(i, raw);
    if (i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    onChange(text);
    const last = Math.min(text.length, 5);
    inputsRef.current[last]?.focus();
  };

  return (
    <div className="flex flex-1 items-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          autoFocus={autoFocus && i === 0}
          className={cn(
            "h-12 w-full min-w-0 rounded-xl border border-border/70 bg-background text-center text-lg font-semibold tabular-nums shadow-sm outline-none transition-all",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            match && "border-emerald-500/60 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
            mismatch && "border-destructive/60 bg-destructive/5 text-destructive"
          )}
        />
      ))}
    </div>
  );
}

/* ─────────── Modern Date Picker ─────────── */

function ModernDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = useMemo(() => new Date(), []);
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear() - 20);
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("en-IN", {
    month: "long",
  });

  const minYear = today.getFullYear() - 100;
  const maxYear = today.getFullYear() - 13;

  const pick = (day) => {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  const navigate = (dir) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < minYear || y > maxYear) return;
    setViewMonth(m);
    setViewYear(y);
  };

  const display = parsed
    ? parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Select date of birth";

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-left text-sm transition-all",
          "hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          open && "border-primary ring-2 ring-primary/20",
          !parsed && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">{display}</span>
        {parsed && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="grid h-5 w-5 place-items-center rounded text-muted-foreground transition hover:bg-accent"
            aria-label="Clear date"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      {open && (
        <div className="animate-scale-in absolute z-50 mt-2 w-[300px] overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-2xl">
          {/* Quick year/month selector */}
          <div className="flex items-center gap-1.5 border-b border-border/60 p-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="flex-1 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-semibold outline-none transition hover:bg-accent focus:border-border"
            >
              {Array.from({ length: 12 }).map((_, m) => (
                <option key={m} value={m}>
                  {new Date(2000, m).toLocaleString("en-IN", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="w-[80px] rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-semibold tabular-nums outline-none transition hover:bg-accent focus:border-border"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => navigate(1)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 px-2 pt-2 text-[10px] font-semibold uppercase text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="grid h-6 place-items-center">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const selected = value === dateStr;
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pick(day)}
                  className={cn(
                    "grid h-8 w-full place-items-center rounded-lg text-xs font-medium tabular-nums transition-all",
                    selected
                      ? "bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-sm shadow-primary/25"
                      : isToday
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-foreground/80 hover:bg-accent hover:text-foreground"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 20);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
              }}
              className="text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              20 years ago
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-primary transition hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}