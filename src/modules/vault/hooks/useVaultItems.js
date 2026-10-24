// src/modules/vault/hooks/useVaultItems.js
"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { useVault } from "../context/VaultContext";
import {
  deriveItemKey,
  encryptObject,
  decryptObject,
  encryptString,
  decryptString,
} from "../crypto";

export function useVaultItems() {
  const { getMasterKey } = useVault();
  const { data, isLoading, mutate } = useSWR("/api/vault/items");

  const decryptAll = useCallback(
    (items) => {
      const mk = getMasterKey();
      if (!mk) return [];
      const itemKey = deriveItemKey(mk);
      const out = [];
      for (const row of items) {
        try {
          const payload = decryptObject(itemKey, {
            ciphertext: row.ciphertext,
            nonce: row.nonce,
          });
          const label = decryptString(itemKey, {
            ciphertext: row.labelCiphertext,
            nonce: row.labelNonce,
          });
          out.push({ ...row, payload, label });
        } catch (err) {
          console.warn("[vault] failed to decrypt", row.id, err.message);
        }
      }
      return out;
    },
    [getMasterKey]
  );

  const items = data?.items ? decryptAll(data.items) : [];

  const create = useCallback(
    async ({ kind, label, payload }) => {
      const mk = getMasterKey();
      if (!mk) throw new Error("Vault locked");
      const itemKey = deriveItemKey(mk);

      const { ciphertext, nonce } = encryptObject(itemKey, payload);
      const { ciphertext: labelCiphertext, nonce: labelNonce } = encryptString(
        itemKey,
        label
      );

      const res = await fetch("/api/vault/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          labelCiphertext,
          labelNonce,
          ciphertext,
          nonce,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      await mutate();
    },
    [getMasterKey, mutate]
  );

  const update = useCallback(
    async (id, { label, payload }) => {
      const mk = getMasterKey();
      if (!mk) throw new Error("Vault locked");
      const itemKey = deriveItemKey(mk);

      const body = {};
      if (payload) {
        const { ciphertext, nonce } = encryptObject(itemKey, payload);
        body.ciphertext = ciphertext;
        body.nonce = nonce;
      }
      if (label) {
        const { ciphertext, nonce } = encryptString(itemKey, label);
        body.labelCiphertext = ciphertext;
        body.labelNonce = nonce;
      }

      const res = await fetch(`/api/vault/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      await mutate();
    },
    [getMasterKey, mutate]
  );

  const remove = useCallback(
    async (id) => {
      await fetch(`/api/vault/items/${id}`, { method: "DELETE" });
      await mutate();
    },
    [mutate]
  );

  return { items, isLoading, create, update, remove, reload: mutate };
}