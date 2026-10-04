// src/app/api/notes/trash/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

const RETENTION_DAYS = 30;

export const GET = withAuth(async (_req, _ctx, user) => {
  // Auto-purge
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 864e5);
  await prisma.note.deleteMany({
    where: { userId: user.id, deletedAt: { lt: cutoff } },
  });

  const notes = await prisma.note.findMany({
    where: { userId: user.id, deletedAt: { not: null } },
    select: {
      id: true,
      title: true,
      plainText: true,
      deletedAt: true,
      category: true,
    },
    orderBy: { deletedAt: "desc" },
  });

  return ok({ notes, retentionDays: RETENTION_DAYS });
});

export const POST = withAuth(async (req, _ctx, user) => {
  const { id } = await req.json();
  const result = await prisma.note.updateMany({
    where: { id, userId: user.id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
  return ok({ restored: result.count });
});

export const DELETE = withAuth(async (req, _ctx, user) => {
  const { id } = await req.json();
  const result = await prisma.note.deleteMany({
    where: { id, userId: user.id },
  });
  return ok({ deleted: result.count });
});