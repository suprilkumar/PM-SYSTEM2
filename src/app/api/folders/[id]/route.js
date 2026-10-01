// src/app/api/folders/[id]/route.js
import { withAuth } from "@/core/api/handler";
import { ok, notFound, badRequest } from "@/core/api/response";
import { folderQueries } from "@/modules/notes/lib/queries";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(40).optional(),
  parentId: z.string().nullable().optional(),
});

export const PATCH = withAuth(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const result = await folderQueries.update({
    userId: user.id, id, data: parsed.data,
  });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});

export const DELETE = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const result = await folderQueries.delete({ userId: user.id, id });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});
