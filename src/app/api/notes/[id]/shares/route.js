// src/app/api/notes/[id]/shares/route.js
import { withAuth } from "@/core/api/handler";
import { ok, notFound } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const GET = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const note = await prisma.note.findFirst({
    where: { id, userId: user.id, deletedAt: null },
    select: { id: true },
  });
  if (!note) return notFound();

  const shares = await prisma.noteShare.findMany({
    where: { noteId: id, ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return ok({ shares });
});

export const DELETE = withAuth(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const { shareId } = await req.json();

  const share = await prisma.noteShare.findFirst({
    where: { id: shareId, noteId: id, ownerId: user.id },
  });
  if (!share) return notFound();

  await prisma.noteShare.delete({ where: { id: shareId } });
  return ok({ success: true });
});