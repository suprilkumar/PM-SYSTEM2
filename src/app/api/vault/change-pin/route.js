// src/app/api/vault/change-pin/route.js
import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const schema = z.object({
  pinHash: z.string().min(1),
  pinSalt: z.string().min(1),
  wrappedByPin: z.string().min(1),
  wrappedByPinNonce: z.string().min(1),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  console.log("[change-pin] body keys:", Object.keys(body));
  console.log("[change-pin] pinHash len:", body?.pinHash?.length);
  console.log("[change-pin] pinSalt len:", body?.pinSalt?.length);
  console.log("[change-pin] wrappedByPin len:", body?.wrappedByPin?.length);
  console.log("[change-pin] wrappedByPinNonce len:", body?.wrappedByPinNonce?.length);

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("[change-pin] validation failed:", parsed.error.flatten());
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: parsed.data,
  });

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "pin_change" },
  });

  return ok({ success: true });
});