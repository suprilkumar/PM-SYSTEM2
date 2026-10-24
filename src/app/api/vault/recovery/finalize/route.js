import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { markVaultVerified } from "@/core/auth/vault-session";
import { z } from "zod";

const schema = z.object({
  kdfSalt: z.string(),
  kdfAlgorithm: z.string(),
  kdfParams: z.record(z.any()),
  wrappedByPassword: z.string(),
  wrappedByPasswordNonce: z.string(),
  wrappedByPin: z.string(),
  wrappedByPinNonce: z.string(),
  checkValue: z.string(),
  checkNonce: z.string(),
  pinHash: z.string(),
  pinSalt: z.string(),
  masterKeyBase64: z.string(),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid payload");

  const { masterKeyBase64, ...rest } = parsed.data;

  // Re-wrap the server recovery envelope with the new... wait, master key is the same
  // Actually server envelope wraps the master key itself — unchanged. Skip re-wrap.

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: rest,
  });

  await markVaultVerified(user.id);
  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "recovery_complete" },
  });

  return ok({ success: true });
});