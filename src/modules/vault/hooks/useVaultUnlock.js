// src/modules/vault/hooks/useVaultUnlock.js
"use client";

import { useCallback } from "react";
import { useVault } from "../context/VaultContext";
import {
  deriveKey,
  unwrapMasterKey,
  verifyCheckValue,
} from "../crypto";

export function useVaultUnlock() {
  const { unlock } = useVault();

  const unlockWithPin = useCallback(
    async ({ pin, settings }) => {
      console.log("[unlock] PIN path");
      console.log("[unlock] kdfSalt:", settings.kdfSalt?.slice(0, 12));
      console.log("[unlock] pinSalt:", settings.pinSalt?.slice(0, 12));

      // PIN key is derived from pinSalt (NOT kdfSalt).
      // This matches what was used to wrap the master key.
      const saltForPin = settings.pinSalt ?? settings.kdfSalt;

      const pinKey = await deriveKey(
        pin,
        saltForPin,
        "pin",
        settings.kdfParams
      );

      let masterKey;
      try {
        masterKey = unwrapMasterKey(
          {
            ciphertext: settings.wrappedByPin,
            nonce: settings.wrappedByPinNonce,
          },
          pinKey
        );
      } catch (err) {
        console.error("[unlock] unwrap FAILED:", err.message);
        throw new Error("Invalid PIN");
      }

      const ok = verifyCheckValue(masterKey, {
        ciphertext: settings.checkValue,
        nonce: settings.checkNonce,
      });
      if (!ok) throw new Error("Invalid PIN");

      unlock(masterKey);
      return masterKey;
    },
    [unlock]
  );

  const unlockWithPassword = useCallback(
    async ({ password, settings }) => {
      const pwKey = await deriveKey(
        password,
        settings.kdfSalt,
        "password",
        settings.kdfParams
      );

      let masterKey;
      try {
        masterKey = unwrapMasterKey(
          {
            ciphertext: settings.wrappedByPassword,
            nonce: settings.wrappedByPasswordNonce,
          },
          pwKey
        );
      } catch (err) {
        console.error("[unlock] unwrap FAILED:", err.message);
        throw new Error("Incorrect password");
      }

      const ok = verifyCheckValue(masterKey, {
        ciphertext: settings.checkValue,
        nonce: settings.checkNonce,
      });
      if (!ok) throw new Error("Incorrect password");

      unlock(masterKey);
      return masterKey;
    },
    [unlock]
  );

  return { unlockWithPin, unlockWithPassword };
}