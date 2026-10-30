// src/modules/vault/context/VaultContext.jsx
"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { bytesToBase64, base64ToBytes } from "@/modules/vault/crypto/kdf";

const VaultContext = createContext(null);

const IDLE_MS = 15 * 60 * 1000;
const HIDDEN_LOCK_MS = 60 * 1000;
const FLAG = "vault:unlocked";
const MK_CACHE = "vault:mk";

export function VaultProvider({ children }) {
  const masterKeyRef = useRef(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const idleTimerRef = useRef(null);
  const [expiresAt, setExpiresAt] = useState(null);

  const lock = useCallback(async (reason = "manual") => {
    masterKeyRef.current = null;
    setIsUnlocked(false);
    setExpiresAt(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(FLAG);
      sessionStorage.removeItem(MK_CACHE);
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
    setExpiresAt(Date.now() + IDLE_MS);
  }, [lock]);

  const unlock = useCallback(
    (masterKey) => {
      masterKeyRef.current = masterKey;
      setIsUnlocked(true);
      resetIdleTimer();
      setExpiresAt(Date.now() + IDLE_MS);
      if (typeof window !== "undefined") {
        // Cache the master key so a page refresh doesn't force re-derive
        // (sessionStorage — cleared when the tab closes).
        try {
          sessionStorage.setItem(MK_CACHE, bytesToBase64(masterKey));
          sessionStorage.setItem(FLAG, "1");
        } catch {
          // Quota errors are non-fatal
        }
        window.dispatchEvent(new CustomEvent("vault:unlocked"));
        window.dispatchEvent(new Event("storage"));
      }
    },
    [resetIdleTimer]
  );

  const getMasterKey = useCallback(() => masterKeyRef.current, []);

  // Reset idle timer on user activity
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

  // Lock when tab is hidden too long
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

  // On mount, restore master key from sessionStorage (fresh page load
  // in the same tab) OR restore the "unlocked" flag so the sidebar
  // stays expanded.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cached = sessionStorage.getItem(MK_CACHE);
    if (cached) {
      try {
        masterKeyRef.current = base64ToBytes(cached);
        setIsUnlocked(true);
        resetIdleTimer();
        setExpiresAt(Date.now() + IDLE_MS);
        return;
      } catch {
        sessionStorage.removeItem(MK_CACHE);
      }
    }

    if (sessionStorage.getItem(FLAG) === "1") {
      // Flag present but no key — sidebar stays expanded; vault pages
      // will redirect to /unlock if they try to fetch items.
      setIsUnlocked(true);
    }
  }, [resetIdleTimer]);

  return (
    <VaultContext.Provider
      value={{ isUnlocked, unlock, lock, getMasterKey, expiresAt, IDLE_MS }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}