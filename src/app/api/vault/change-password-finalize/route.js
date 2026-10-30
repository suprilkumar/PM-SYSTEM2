import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { serverWrapMaster } from "@/modules/vault/lib/server-recovery";
import { z } from "zod";

const schema = z.object({
  kdfSalt: z.string(),
  kdfAlgorithm: z.string(),
  kdfParams: z.record(z.any()),
  wrappedByPassword: z.string(),
  wrappedByPasswordNonce: z.string(),
  checkValue: z.string(),
  checkNonce: z.string(),
  masterKeyBase64: z.string(),
  reencryptedItems: z.array(
    z.object({
      id: z.string(),
      ciphertext: z.string(),
      nonce: z.string(),
      labelCiphertext: z.string(),
      labelNonce: z.string(),
    })
  ),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    console.error("[change-password-finalize] validation:", parsed.error.flatten());
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { masterKeyBase64, reencryptedItems, ...settingsUpdate } = parsed.data;
  const serverRecovery = serverWrapMaster(masterKeyBase64);

  const ids = reencryptedItems.map((i) => i.id);
  const owned = await prisma.vaultItem.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return badRequest("Some items don't belong to you");
  }

  await prisma.$transaction([
    ...reencryptedItems.map((i) =>
      prisma.vaultItem.update({
        where: { id: i.id },
        data: {
          ciphertext: i.ciphertext,
          nonce: i.nonce,
          labelCiphertext: i.labelCiphertext,
          labelNonce: i.labelNonce,
        },
      })
    ),
    prisma.vaultSettings.update({
      where: { userId: user.id },
      data: {
        ...settingsUpdate,
        serverRecoveryBlob: serverRecovery.ciphertext,
        serverRecoveryNonce: serverRecovery.nonce,
        // pinHash, pinSalt, wrappedByPin, wrappedByPinNonce stay untouched
      },
    }),
    prisma.vaultAudit.create({
      data: { userId: user.id, action: "password_change" },
    }),
  ]);

  return ok({ success: true });
});