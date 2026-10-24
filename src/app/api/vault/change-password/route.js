import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const schema = z.object({
  kdfSalt: z.string().min(1),
  kdfAlgorithm: z.string(),
  kdfParams: z.record(z.any()),
  wrappedMaster: z.string().min(1),
  wrappedNonce: z.string().min(1),
  wrappedAlgorithm: z.string(),
  checkValue: z.string().min(1),
  checkNonce: z.string().min(1),
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
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const { reencryptedItems, ...settingsUpdate } = parsed.data;

  // Verify all items belong to this user
  const ids = reencryptedItems.map((i) => i.id);
  const owned = await prisma.vaultItem.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return badRequest("Some items don't belong to you");
  }

  await prisma.$transaction([
    // Update all re-encrypted items
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
    // Update vault settings
    prisma.vaultSettings.update({
      where: { userId: user.id },
      data: settingsUpdate,
    }),
    // Audit
    prisma.vaultAudit.create({
      data: { userId: user.id, action: "update", itemId: null },
    }),
  ]);

  return ok({ success: true });
});