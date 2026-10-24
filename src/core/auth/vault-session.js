// src/core/auth/vault-session.js
import { cookies } from "next/headers";
import crypto from "node:crypto";

const COOKIE = "vault_verified";
const TTL_MS = 15 * 60 * 1000;

console.log("[vault-session] module loaded");

function secret() {
  const s =
    process.env.BETTER_AUTH_SECRET ??
    process.env.ENCRYPTION_KEY ??
    process.env.NEXTAUTH_SECRET;
  if (!s) {
    console.error("[vault-session] FATAL: no signing secret");
    throw new Error("Missing vault session secret");
  }
  return s;
}

/**
 * Build cookie name/value/options for direct use on a NextResponse.
 * Pure function — no side effects.
 */
export function buildVaultCookie(userId) {
  console.log("[vault-session] buildVaultCookie for", userId);
  const payload = JSON.stringify({ uid: userId, t: Date.now() });
  const sig = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  const value = `${Buffer.from(payload).toString("base64url")}.${sig}`;

  return {
    name: COOKIE,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.floor(TTL_MS / 1000),
    },
  };
}

/**
 * Set the cookie via Next's cookies() store.
 * Prefer buildVaultCookie + res.cookies.set() in route handlers.
 */
export async function markVaultVerified(userId) {
  console.log("[vault-session] markVaultVerified for", userId);
  const cookie = buildVaultCookie(userId);
  const store = await cookies();
  store.set(cookie.name, cookie.value, cookie.options);
}

/**
 * Read the cookie, verify signature, user id, and freshness.
 */
export async function isVaultVerified(userId) {
  console.log("[vault-session] isVaultVerified for", userId);

  const store = await cookies();
  const raw = store.get(COOKIE)?.value;

  if (!raw) {
    console.log("[vault-session] NO COOKIE");
    return false;
  }

  console.log("[vault-session] raw cookie:", raw.slice(0, 40) + "...");

  const parts = raw.split(".");
  if (parts.length !== 2) {
    console.log("[vault-session] MALFORMED — parts:", parts.length);
    return false;
  }

  const [bodyB64, sig] = parts;
  const payload = Buffer.from(bodyB64, "base64url").toString();

  const expected = crypto
    .createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");

  if (sig.length !== expected.length) {
    console.log("[vault-session] LENGTH MISMATCH", sig.length, "vs", expected.length);
    return false;
  }

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);

  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    console.log("[vault-session] SIGNATURE MISMATCH");
    console.log("  expected:", expected.slice(0, 20) + "...");
    console.log("  received:", sig.slice(0, 20) + "...");
    return false;
  }

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch (err) {
    console.log("[vault-session] PAYLOAD PARSE ERROR:", err.message);
    return false;
  }

  if (parsed.uid !== userId) {
    console.log("[vault-session] USER MISMATCH — cookie:", parsed.uid, "current:", userId);
    return false;
  }

  const age = Date.now() - parsed.t;
  if (age > TTL_MS) {
    console.log("[vault-session] EXPIRED — age", Math.floor(age / 1000), "s");
    return false;
  }

  console.log("[vault-session] OK — verified");
  return true;
}

export async function clearVaultVerified() {
  console.log("[vault-session] clearVaultVerified");
  const store = await cookies();
  store.delete(COOKIE);
}