// src/modules/vault/crypto/check-value.js
import { encryptString, decryptString } from "./cipher";

const CHECK_PLAINTEXT = "vault-check-v1";

export function makeCheckValue(masterKey) {
  return encryptString(masterKey, CHECK_PLAINTEXT);
}

export function verifyCheckValue(masterKey, checkValue) {
  try {
    const plain = decryptString(masterKey, checkValue);
    return plain === CHECK_PLAINTEXT;
  } catch {
    return false;
  }
}