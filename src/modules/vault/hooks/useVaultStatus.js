// src/modules/vault/hooks/useVaultStatus.js
"use client";

import { useEffect, useState } from "react";

const FLAG = "vault:unlocked";

export function useVaultStatus() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const check = () => {
      setUnlocked(sessionStorage.getItem(FLAG) === "1");
    };
    check();

    const events = ["vault:locked", "vault:unlocked", "storage"];
    events.forEach((e) => window.addEventListener(e, check));

    // Poll as a fallback for cross-tab sync
    const interval = setInterval(check, 2000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, check));
      clearInterval(interval);
    };
  }, []);

  return { unlocked };
}