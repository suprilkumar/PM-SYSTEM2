// src/modules/vault/crypto/kdf.js
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";

export const DEFAULT_KDF = {
  algorithm: "pbkdf2",
  iterations: 210_000,
  dkLen: 32,
  hash: "sha512",
};

export const ARGON2_PARAMS = {
  algorithm: "argon2id",
  memory: 64 * 1024,
  iterations: 3,
  parallelism: 1,
  dkLen: 32,
};

export async function deriveKey(
  password,
  saltB64,
  purpose = "",
  params = DEFAULT_KDF
) {
  const salt = base64ToBytes(saltB64);
  const info = utf8ToBytes(purpose);
  const passwordBytes = utf8ToBytes(password);

  if (params.algorithm === "argon2id") {
    const { argon2id } = await import("@noble/hashes/argon2.js");
    return argon2id(passwordBytes, concatBytes(salt, info), {
      t: params.iterations,
      m: params.memory,
      p: params.parallelism,
      dkLen: params.dkLen,
    });
  }

  const hashFn = params.hash === "sha256" ? sha256 : sha512;
  return pbkdf2(hashFn, passwordBytes, concatBytes(salt, info), {
    c: params.iterations,
    dkLen: params.dkLen,
  });
}

export function utf8ToBytes(s) {
  return new TextEncoder().encode(s);
}

export function bytesToUtf8(b) {
  return new TextDecoder().decode(b);
}

// export function base64ToBytes(b64) {
//   const bin = atob(b64);
//   const out = new Uint8Array(bin.length);
//   for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
//   return out;
// }

export function base64ToBytes(b64) {
  if (!b64) return new Uint8Array(0);

  // Normalize base64url → base64
  let s = String(b64).replace(/-/g, "+").replace(/_/g, "/");

  // Pad to multiple of 4
  const pad = (4 - (s.length % 4)) % 4;
  if (pad) s += "=".repeat(pad);

  // Decode
  let bin;
  try {
    bin = atob(s);
  } catch (err) {
    throw new Error(
      `base64ToBytes: invalid base64 input (${err.message}). Input starts with: ${String(b64).slice(0, 12)}…`
    );
  }

  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// export function bytesToBase64(bytes) {
//   let bin = "";
//   for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
//   return btoa(bin);
// }

export function bytesToBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function concatBytes(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

export function randomBytes(n) {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

export function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
