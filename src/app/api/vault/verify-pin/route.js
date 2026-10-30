// src/app/api/vault/verify-pin/route.js
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { withAuth } from "@/core/api/handler";
import { badRequest, unauthorized } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";
import { base64ToBytes, bytesToBase64, concatBytes } from "@/modules/vault/crypto/kdf";
import { buildVaultCookie } from "@/core/auth/vault-session";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const schema = z.object({ pin: z.string().length(6) });

/**
 * Node-native PBKDF2 (~200ms at 600k iterations vs ~22s in pure JS).
 * Must produce the exact same bytes as @noble/hashes/pbkdf2.
 */
function pbkdf2Native(password, salt, iterations, dkLen, hash) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, dkLen, hash, (err, key) => {
      if (err) reject(err);
      else resolve(new Uint8Array(key));
    });
  });
}

async function derivePinHash(pin, saltB64, kdfParams) {
  const salt = base64ToBytes(saltB64);
  const info = new TextEncoder().encode("pin-hash");

  // Must match exactly what setup produced:
  //   concatBytes(salt, info) as the effective salt
  const effectiveSalt = concatBytes(salt, info);
  const password = new TextEncoder().encode(pin);
  const hash = kdfParams.hash === "sha256" ? "sha256" : "sha512";

  return pbkdf2Native(
    password,
    effectiveSalt,
    kdfParams.iterations,
    kdfParams.dkLen,
    hash
  );
}

export const POST = withAuth(async (req, _ctx, user) => {
  const start = Date.now();
  console.log("[verify-pin] START for", user.id);

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid PIN format");

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s) return badRequest("Vault not configured");

  if (s.lockedUntil && s.lockedUntil > new Date()) {
    return unauthorized(`Locked until ${s.lockedUntil.toISOString()}`);
  }

  let computedB64;
  try {
    const t0 = Date.now();
    const computed = await derivePinHash(
      parsed.data.pin,
      s.pinSalt,
      s.kdfParams
    );
    console.log("[verify-pin] derive took", Date.now() - t0, "ms");
    computedB64 = bytesToBase64(computed);
  } catch (err) {
    console.error("[verify-pin] derivation error:", err.message);
    return badRequest(err.message);
  }

  console.log("[verify-pin] computed :", computedB64.slice(0, 16));
  console.log("[verify-pin] stored   :", s.pinHash.slice(0, 16));
  console.log("[verify-pin] kdfAlgo  :", s.kdfParams?.algorithm);
  console.log("[verify-pin] kdfHash  :", s.kdfParams?.hash);
  console.log("[verify-pin] kdfIter  :", s.kdfParams?.iterations);

  if (computedB64 !== s.pinHash) {
    const failed = s.failedAttempts + 1;
    const lockedUntil =
      failed >= MAX_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60_000)
        : null;
    await prisma.vaultSettings.update({
      where: { userId: user.id },
      data: { failedAttempts: failed, lockedUntil },
    });
    console.log("[verify-pin] MISMATCH — attempt", failed);
    return unauthorized(
      lockedUntil
        ? `Too many attempts. Locked for ${LOCK_MINUTES} minutes.`
        : `Incorrect PIN. ${MAX_ATTEMPTS - failed} attempts left.`
    );
  }

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  try {
    await prisma.vaultAudit.create({
      data: { userId: user.id, action: "unlock" },
    });
  } catch {}

  const cookie = buildVaultCookie(user.id);
  const res = NextResponse.json({ verified: true }, { status: 200 });
  res.cookies.set(cookie.name, cookie.value, cookie.options);

  console.log("[verify-pin] total", Date.now() - start, "ms");
  return res;
});