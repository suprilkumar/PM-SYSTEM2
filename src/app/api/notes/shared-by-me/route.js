// src/app/api/notes/shared-by-me/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const GET = withAuth(async (_req, _ctx, user) => {
  const shares = await prisma.noteShare.findMany({
    where: { ownerId: user.id, status: { in: ["pending", "accepted"] } },
    include: {
      note: {
        select: { id: true, title: true, plainText: true, updatedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    shares: shares.map((s) => ({
      id: s.id,
      email: s.email,
      role: s.role,
      status: s.status,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      url: `/share/${s.token}`,   // relative; client builds absolute
      note: s.note,
    })),
  });
});