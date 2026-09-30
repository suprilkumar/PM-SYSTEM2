// src/app/api/finance/categories/[id]/route.js
import { revalidateTag } from "next/cache";
import { withAuth } from "@/core/api/handler";
import { ok, notFound, badRequest } from "@/core/api/response";
import { categoryQueries } from "@/modules/finance/lib/queries";
import { categoryUpdateSchema } from "@/modules/finance/lib/validation";

export const PATCH = withAuth(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const existing = await categoryQueries.byId({ userId: user.id, id });
  if (!existing) return notFound();

  const result = await categoryQueries.update({
    userId: user.id,
    id,
    data: parsed.data,
  });
  if (result.count === 0) return notFound();

  revalidateTag(`finance-${user.id}`);
  return ok({ success: true });
});

export const DELETE = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;

  const existing = await categoryQueries.byId({ userId: user.id, id });
  if (!existing) return notFound();

  const check = await categoryQueries.canDelete({ userId: user.id, id });
  if (check.children > 0) {
    return badRequest(
      "This category has subcategories. Delete them first, or archive instead."
    );
  }
  if (check.transactions > 0) {
    return badRequest(
      "This category has transactions attached. Archive it instead of deleting."
    );
  }

  const result = await categoryQueries.delete({ userId: user.id, id });
  if (result.count === 0) return notFound();

  revalidateTag(`finance-${user.id}`);
  return ok({ success: true });
});