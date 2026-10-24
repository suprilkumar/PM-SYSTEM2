// src/modules/vault/crypto/recovery.js
import { randomBytes } from "./kdf";

// Wordless recovery code — 32 chars base32, grouped in 4s for readability.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateRecoveryCode() {
  const bytes = randomBytes(20); // 160 bits
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i] % 32];
  }
  // Group into 4-char chunks: ABCD-EFGH-...
  return out.match(/.{1,4}/g).join("-");
}

export function normalizeRecoveryCode(code) {
  return code.replace(/[\s-]/g, "").toUpperCase();
}