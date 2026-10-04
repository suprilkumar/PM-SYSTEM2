// src/app/api/finance/transactions/trash/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

const RETENTION_DAYS = 30;

export const GET = withAuth(async (_req, _ctx, user) => {
  // Auto-purge items older than RETENTION_DAYS
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 864e5);
  await prisma.transaction.deleteMany({
    where: { userId: user.id, deletedAt: { lt: cutoff } },
  });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id, deletedAt: { not: null } },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      parentCategory: { select: { id: true, name: true } },
    },
    orderBy: { deletedAt: "desc" },
  });

  return ok({ transactions, retentionDays: RETENTION_DAYS });
});

// Restore
export const POST = withAuth(async (req, _ctx, user) => {
  const { id } = await req.json();
  const result = await prisma.transaction.updateMany({
    where: { id, userId: user.id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  return ok({ restored: result.count });
});

// Permanent delete
export const DELETE = withAuth(async (req, _ctx, user) => {
  const { id } = await req.json();
  const result = await prisma.transaction.deleteMany({
    where: { id, userId: user.id },
  });
  return ok({ deleted: result.count });
});