// src/app/api/vault/lock/route.js
import { NextResponse } from "next/server";
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const POST = withAuth(async (_req, _ctx, user) => {
  try {
    await prisma.vaultAudit.create({
      data: { userId: user.id, action: "lock" },
    });
  } catch (err) {
    console.warn("[vault-lock] audit failed:", err.message);
  }

  // Clear the cookie on the response directly
  const res = NextResponse.json({ locked: true }, { status: 200 });
  res.cookies.delete("vault_verified");
  return res;
});