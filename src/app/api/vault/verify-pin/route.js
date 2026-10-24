// src/app/api/vault/verify-pin/route.js
import { NextResponse } from "next/server";
import { withAuth } from "@/core/api/handler";
import { badRequest, unauthorized } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha256, sha512 } from "@noble/hashes/sha2.js";
import {
  base64ToBytes,
  bytesToBase64,
  utf8ToBytes,
  concatBytes,
} from "@/modules/vault/crypto/kdf";
import { buildVaultCookie } from "@/core/auth/vault-session";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const schema = z.object({ pin: z.string().length(6) });

/**
 * Recompute PIN hash EXACTLY as setup did.
 *
 * Setup does:
 *   deriveKey(pin, salt, "pin-hash", kdfParams)
 * which internally:
 *   pbkdf2(hashFn, pin, concat(salt, "pin-hash"), iterations, dkLen)
 */
function derivePinHash(pin, saltB64, kdfParams) {
  const salt = base64ToBytes(saltB64);
  const info = utf8ToBytes("pin-hash");
  const password = utf8ToBytes(pin);

  if (kdfParams.algorithm === "argon2id") {
    throw new Error(
      "PIN was set up with argon2id — this app requires pbkdf2 for server-side PIN verification"
    );
  }

  const hashFn = kdfParams.hash === "sha256" ? sha256 : sha512;

  return pbkdf2(hashFn, password, concatBytes(salt, info), {
    c: kdfParams.iterations,
    dkLen: kdfParams.dkLen,
  });
}

export const POST = withAuth(async (req, _ctx, user) => {
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
    computedB64 = bytesToBase64(
      derivePinHash(parsed.data.pin, s.pinSalt, s.kdfParams)
    );
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

  console.log("[verify-pin] OK — issuing cookie");
  const cookie = buildVaultCookie(user.id);
  const res = NextResponse.json({ verified: true }, { status: 200 });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
});