// src/modules/vault/crypto/cipher.js
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import {
  bytesToBase64,
  base64ToBytes,
  utf8ToBytes,
  bytesToUtf8,
  randomBytes,
} from "./kdf";

const ALGO = "xchacha20-poly1305";
const NONCE_LEN = 24;

export function encryptString(key, plaintext) {
  const nonce = randomBytes(NONCE_LEN);
  const cipher = xchacha20poly1305(key, nonce);
  const ciphertext = cipher.encrypt(utf8ToBytes(plaintext));

  return {
    ciphertext: bytesToBase64(ciphertext),
    nonce: bytesToBase64(nonce),
    algorithm: ALGO,
  };
}

export function decryptString(key, payload) {
  const ciphertext = base64ToBytes(payload.ciphertext);
  const nonce = base64ToBytes(payload.nonce);
  const cipher = xchacha20poly1305(key, nonce);
  const plaintext = cipher.decrypt(ciphertext);
  return bytesToUtf8(plaintext);
}

export function encryptObject(key, obj) {
  return encryptString(key, JSON.stringify(obj));
}

export function decryptObject(key, payload) {
  return JSON.parse(decryptString(key, payload));
}