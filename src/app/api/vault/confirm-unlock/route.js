// src/app/api/vault/confirm-unlock/route.js


/**
 * Called after the client has successfully derived the master key using
 * the PASSWORD path. The server cannot verify the password, so this route
 * is trust-on-assertion — the client only calls it after decrypting the
 * check-value successfully.
 *
 * Abuse window: someone with the session cookie could call this without
 * knowing the password — but they still can't decrypt anything without
 * the master key. So the cookie alone grants nothing.
 */

import { NextResponse } from "next/server";
import { withAuth } from "@/core/api/handler";
import { prisma } from "@/core/db/client";
import { buildVaultCookie } from "@/core/auth/vault-session";

export const POST = withAuth(async (_req, _ctx, user) => {
  try {
    await prisma.vaultAudit.create({
      data: { userId: user.id, action: "unlock" },
    });
  } catch (err) {
    console.warn("[confirm-unlock] audit failed:", err.message);
  }

  const cookie = buildVaultCookie(user.id);
  const res = NextResponse.json({ verified: true }, { status: 200 });
  res.cookies.set(cookie.name, cookie.value, cookie.options);
  return res;
});