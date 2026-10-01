// src/app/api/notes/shares/[shareId]/route.js  (new file)
import { withAuth } from "@/core/api/handler";
import { ok, notFound } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const DELETE = withAuth(async (_req, ctx, user) => {
  const { shareId } = await ctx.params;

  const share = await prisma.noteShare.findFirst({
    where: { id: shareId, ownerId: user.id },
  });
  if (!share) return notFound();

  await prisma.noteShare.delete({ where: { id: shareId } });
  return ok({ success: true });
});