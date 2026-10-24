// src/modules/vault/crypto/keys.js
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { encryptObject, decryptObject } from "./cipher";
import { utf8ToBytes, randomBytes, bytesToBase64, base64ToBytes } from "./kdf";

const PURPOSE_ITEM = "vault-item-v1";

export function deriveItemKey(masterKey) {
  return hkdf(sha256, masterKey, undefined, utf8ToBytes(PURPOSE_ITEM), 32);
}

export function wrapMasterKey(masterKey, wrappingKey) {
  return encryptObject(wrappingKey, { mk: bytesToBase64(masterKey) });
}

export function unwrapMasterKey(wrapped, wrappingKey) {
  const { mk } = decryptObject(wrappingKey, wrapped);
  return base64ToBytes(mk);
}

export function generateSalt() {
  return bytesToBase64(randomBytes(16));
}