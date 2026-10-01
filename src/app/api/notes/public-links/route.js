// src/app/api/notes/public-links/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const GET = withAuth(async (_req, _ctx, user) => {
  const notes = await prisma.note.findMany({
    where: { userId: user.id, deletedAt: null, isPublic: true },
    select: {
      id: true,
      title: true,
      plainText: true,
      publicSlug: true,
      viewCount: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return ok({
    notes: notes.map((n) => ({
      ...n,
      url: `/notes/public/${n.publicSlug}`,
    })),
  });
});