// src/app/api/finance/transactions/[id]/route.js
import { withAuth } from "@/core/api/handler";
import { ok, notFound, badRequest } from "@/core/api/response";
import { transactionQueries, categoryQueries } from "@/modules/finance/lib/queries";
import { transactionUpdateSchema } from "@/modules/finance/lib/validation";

export const GET = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const txn = await transactionQueries.byId({ userId: user.id, id });
  if (!txn) return notFound();
  return ok(txn);
});

export const PATCH = withAuth(async (req, ctx, user) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = transactionUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const data = { ...parsed.data };

  // If categoryId changed, refresh parentCategoryId
  if (data.categoryId) {
    const cat = await categoryQueries.byId({ userId: user.id, id: data.categoryId });
    if (!cat) return badRequest("Category not found");
    data.parentCategoryId = cat.parentId ?? null;
    data.type = cat.type;
  }

  const result = await transactionQueries.update({ userId: user.id, id, data });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});

export const DELETE = withAuth(async (_req, ctx, user) => {
  const { id } = await ctx.params;
  const result = await transactionQueries.softDelete({ userId: user.id, id });
  if (result.count === 0) return notFound();
  return ok({ success: true });
});