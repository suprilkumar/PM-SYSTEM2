// src/app/api/finance/categories/route.js
import { revalidateTag } from "next/cache";
import { withAuth } from "@/core/api/handler";
import { okCached, created, badRequest } from "@/core/api/response";
import { categoryQueries } from "@/modules/finance/lib/queries";
import { categoryCreateSchema } from "@/modules/finance/lib/validation";
import { seedCategoriesIfEmpty } from "@/modules/finance/lib/seed";

export const GET = withAuth(async (req, _ctx, user) => {
  await seedCategoriesIfEmpty(user.id);

  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get("archived") === "true";

  const categories = await categoryQueries.list({
    userId: user.id,
    includeArchived,
  });

  // Categories change rarely — safe to cache longer
  return okCached({ categories }, { seconds: 60 });
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  if (parsed.data.parentId) {
    const parent = await categoryQueries.byId({
      userId: user.id,
      id: parsed.data.parentId,
    });
    if (!parent) return badRequest("Parent category not found");
    if (parent.type !== parsed.data.type) {
      return badRequest("Parent type must match child type");
    }
  }

  const category = await categoryQueries.create({
    userId: user.id,
    data: { ...parsed.data, isCustom: true },
  });

  revalidateTag(`finance-${user.id}`);
  return created(category);
});