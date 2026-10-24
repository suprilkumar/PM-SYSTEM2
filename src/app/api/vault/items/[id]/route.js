import { withVault } from "@/core/api/vault-handler";
import { ok, notFound, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const patchSchema = z.object({
  kind: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/i).optional(),
  labelCiphertext: z.string().optional(),
  labelNonce: z.string().optional(),
  ciphertext: z.string().optional(),
  nonce: z.string().optional(),
  algorithm: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const GET = withVault(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const item = await prisma.vaultItem.findFirst({
    where: { id, userId: user.id, deletedAt: null },
  });
  if (!item) return notFound();

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "read", itemId: id },
  });

  return ok(item);
});

export const PATCH = withVault(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const result = await prisma.vaultItem.updateMany({
    where: { id, userId: user.id },
    data: { ...parsed.data, updatedAt: new Date() },
  });
  if (result.count === 0) return notFound();

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "update", itemId: id },
  });

  return ok({ success: true });
});

export const DELETE = withVault(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const result = await prisma.vaultItem.updateMany({
    where: { id, userId: user.id },
    data: { deletedAt: new Date() },
  });
  if (result.count === 0) return notFound();

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "delete", itemId: id },
  });

  return ok({ success: true });
});