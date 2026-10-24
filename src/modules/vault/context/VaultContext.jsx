"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

const VaultContext = createContext(null);

const IDLE_MS = 5 * 60 * 1000;
const HIDDEN_LOCK_MS = 60 * 1000;
const FLAG = "vault:unlocked";

export function VaultProvider({ children }) {
  const masterKeyRef = useRef(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const idleTimerRef = useRef(null);

  const lock = useCallback(async (reason = "manual") => {
    masterKeyRef.current = null;
    setIsUnlocked(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(FLAG);
    }
    try {
      await fetch("/api/vault/lock", { method: "POST" });
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vault:locked", { detail: { reason } }));
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => lock("idle"), IDLE_MS);
  }, [lock]);

  const unlock = useCallback(
    (masterKey) => {
      masterKeyRef.current = masterKey;
      setIsUnlocked(true);
      resetIdleTimer();
      if (typeof window !== "undefined") {
        sessionStorage.setItem(FLAG, "1");
        window.dispatchEvent(new CustomEvent("vault:unlocked"));
        window.dispatchEvent(new Event("storage"));
      }
    },
    [resetIdleTimer]
  );

  const getMasterKey = useCallback(() => masterKeyRef.current, []);

  // Reset idle timer on activity
  useEffect(() => {
    if (!isUnlocked) return;
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    const handler = () => resetIdleTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isUnlocked, resetIdleTimer]);

  // Lock on hidden too long
  const hiddenAtRef = useRef(null);
  useEffect(() => {
    if (!isUnlocked) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
      } else if (hiddenAtRef.current) {
        const hiddenFor = Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;
        if (hiddenFor >= HIDDEN_LOCK_MS) lock("hidden");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isUnlocked, lock]);

  // On mount, restore isUnlocked from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(FLAG) === "1") {
      // We don't have the key anymore — but the UI state says unlocked.
      // If the user navigates to a vault page, the key will be missing
      // and they'll get redirected to unlock. This just keeps the
      // sidebar expanded.
      setIsUnlocked(true);
    }
  }, []);

  return (
    <VaultContext.Provider value={{ isUnlocked, unlock, lock, getMasterKey }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}