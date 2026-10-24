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
      console.log("[unlock] kdfSalt:", settings.kdfSalt?.slice(0, 16));
      console.log("[unlock] wrappedByPin present:", !!settings.wrappedByPin);

      const pinKey = await deriveKey(pin, settings.kdfSalt, "pin", settings.kdfParams);
      console.log("[unlock] pinKey:", Array.from(pinKey.slice(0, 8)));

      let masterKey;
      try {
        masterKey = unwrapMasterKey(
          { ciphertext: settings.wrappedByPin, nonce: settings.wrappedByPinNonce },
          pinKey
        );
        console.log("[unlock] unwrapped OK");
      } catch (err) {
        console.error("[unlock] unwrap FAILED:", err.message);
        throw new Error("Invalid PIN");
      }

      const ok = verifyCheckValue(masterKey, {
        ciphertext: settings.checkValue,
        nonce: settings.checkNonce,
      });
      console.log("[unlock] check value:", ok);
      if (!ok) throw new Error("Invalid PIN");

      unlock(masterKey);
      return masterKey;
    },
    [unlock]
  );

  const unlockWithPassword = useCallback(
    async ({ password, settings }) => {
      console.log("[unlock] PASSWORD path");
      console.log("[unlock] kdfSalt:", settings.kdfSalt?.slice(0, 16));
      console.log("[unlock] wrappedByPassword present:", !!settings.wrappedByPassword);
      console.log("[unlock] password length:", password.length);

      const pwKey = await deriveKey(
        password,
        settings.kdfSalt,
        "password",
        settings.kdfParams
      );
      console.log("[unlock] pwKey:", Array.from(pwKey.slice(0, 8)));

      let masterKey;
      try {
        masterKey = unwrapMasterKey(
          {
            ciphertext: settings.wrappedByPassword,
            nonce: settings.wrappedByPasswordNonce,
          },
          pwKey
        );
        console.log("[unlock] unwrapped OK");
      } catch (err) {
        console.error("[unlock] unwrap FAILED:", err.message);
        console.error("[unlock] nonce length:", settings.wrappedByPasswordNonce?.length);
        console.error("[unlock] ciphertext length:", settings.wrappedByPassword?.length);
        throw new Error("Incorrect password");
      }

      const ok = verifyCheckValue(masterKey, {
        ciphertext: settings.checkValue,
        nonce: settings.checkNonce,
      });
      console.log("[unlock] check value:", ok);
      if (!ok) throw new Error("Incorrect password");

      unlock(masterKey);
      return masterKey;
    },
    [unlock]
  );

  return { unlockWithPin, unlockWithPassword };
}