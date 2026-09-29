// src/app/api/finance/transactions/route.js
import { withAuth } from "@/core/api/handler";
import { ok, created, badRequest } from "@/core/api/response";
import { transactionQueries, categoryQueries } from "@/modules/finance/lib/queries";
import { transactionCreateSchema } from "@/modules/finance/lib/validation";

export const GET = withAuth(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 30);
  const type = searchParams.get("type") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const from = fromStr ? new Date(fromStr) : undefined;
  const to = toStr ? new Date(toStr) : undefined;

  const [transactions, total] = await Promise.all([
    transactionQueries.list({
      userId: user.id,
      type,
      categoryId,
      from,
      to,
      search,
      page,
      limit,
    }),
    transactionQueries.count({ userId: user.id, type, categoryId, from, to, search }),
  ]);

  return ok({
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = transactionCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const cat = await categoryQueries.byId({
    userId: user.id,
    id: parsed.data.categoryId,
  });
  if (!cat) return badRequest("Category not found");
  if (cat.type !== parsed.data.type) {
    return badRequest("Category type mismatch");
  }

  const txn = await transactionQueries.create({
    userId: user.id,
    data: {
      amount: parsed.data.amount,
      type: parsed.data.type,
      categoryId: cat.id,
      parentCategoryId: cat.parentId ?? null,
      date: parsed.data.date,
      description: parsed.data.description ?? null,
      paymentMethod: parsed.data.paymentMethod,
      isRecurring: parsed.data.isRecurring ?? false,
      recurrenceRule: parsed.data.recurrenceRule ?? null,
      metadata: parsed.data.metadata ?? null,
    },
  });

  return created(txn);
});