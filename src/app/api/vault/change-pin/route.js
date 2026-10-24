import { withAuth } from "@/core/api/handler";
import { ok, badRequest, unauthorized } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const schema = z.object({
  // Client sends proof that they know the old password by providing
  // a re-derived wrapped blob. Server just checks it's consistent.
  // But simpler: client sends the new pinHash + pinSalt + wrappedByPin
  // AFTER verifying old password client-side.
  pinHash: z.string().min(1),
  pinSalt: z.string().min(1),
  wrappedByPin: z.string().min(1),
  wrappedByPinNonce: z.string().min(1),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid payload");

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: parsed.data,
  });

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "pin_change" },
  });

  return ok({ success: true });
});