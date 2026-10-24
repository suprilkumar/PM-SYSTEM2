import crypto from "node:crypto";

const ALGO = "aes-256-gcm";

function getKey() {
  const secret = process.env.VAULT_RECOVERY_SECRET;
  if (!secret) throw new Error("VAULT_RECOVERY_SECRET env var is missing");
  // Derive a 32-byte key from the secret
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt the master key with the server-held secret.
 * Output: { ciphertext: base64, nonce: base64 } — AES-256-GCM
 */
export function serverWrapMaster(masterKeyBase64) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(masterKeyBase64, "base64")),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    nonce: iv.toString("base64"),
  };
}

export function serverUnwrapMaster({ ciphertext, nonce }) {
  const key = getKey();
  const iv = Buffer.from(nonce, "base64");
  const data = Buffer.from(ciphertext, "base64");
  const authTag = data.slice(-16);
  const encrypted = data.slice(0, -16);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("base64");
}