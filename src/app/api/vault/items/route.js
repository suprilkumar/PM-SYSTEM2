import { withVault } from "@/core/api/vault-handler";
import { ok, created, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const createSchema = z.object({
  kind: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/i, "Invalid kind format"),
  labelCiphertext: z.string().min(1),
  labelNonce: z.string().min(1),
  ciphertext: z.string().min(1),
  nonce: z.string().min(1),
  algorithm: z.string().default("xchacha20-poly1305"),
});

export const GET = withVault(async (_req, _ctx, user) => {
  const items = await prisma.vaultItem.findMany({
    where: { userId: user.id, deletedAt: null, isArchived: false },
    orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      kind: true,
      labelCiphertext: true,
      labelNonce: true,
      ciphertext: true,
      nonce: true,
      algorithm: true,
      isFavorite: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return ok({ items });
});

export const POST = withVault(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const item = await prisma.vaultItem.create({
    data: { ...parsed.data, userId: user.id },
  });

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "create", itemId: item.id },
  });

  return created({ id: item.id });
});