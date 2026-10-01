// src/app/api/notes/[id]/move/route.js
import { withAuth } from "@/core/api/handler";
import { ok, notFound } from "@/core/api/response";
import { notesQueries } from "@/modules/notes/lib/queries";

export const PATCH = withAuth(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const { folderId } = await req.json();

  const result = await notesQueries.moveToFolder({
    userId: user.id, id, folderId: folderId || null,
  });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});