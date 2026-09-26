import { withAuth } from "@/core/api/handler";
import { ok, notFound, badRequest } from "@/core/api/response";
import { notesQueries } from "@/modules/notes/lib/queries";
import { noteUpdateSchema } from "@/modules/notes/lib/validation";

export const GET = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;      // Next 16: params is a Promise
  const note = await notesQueries.byId({ userId: user.id, id });
  if (!note) return notFound();
  return ok(note);
});

export const PATCH = withAuth(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = noteUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const result = await notesQueries.update({ userId: user.id, id, data: parsed.data });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});

export const DELETE = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const result = await notesQueries.softDelete({ userId: user.id, id });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});