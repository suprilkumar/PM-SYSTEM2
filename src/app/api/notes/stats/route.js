// src/app/api/notes/stats/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const GET = withAuth(async (_req, _ctx, user) => {
  const [mine, shared, publicLinks] = await Promise.all([
    prisma.note.count({
      where: { userId: user.id, deletedAt: null, isArchived: false },
    }),
    prisma.noteShare.count({
      where: { ownerId: user.id, status: { in: ["pending", "accepted"] } },
    }),
    prisma.note.count({
      where: { userId: user.id, deletedAt: null, isPublic: true },
    }),
  ]);

  return ok({ mine, shared, publicLinks });
});