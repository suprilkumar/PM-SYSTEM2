// src/app/api/folders/route.js
import { withAuth } from "@/core/api/handler";
import { ok, created, badRequest } from "@/core/api/response";
import { folderQueries } from "@/modules/notes/lib/queries";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(40).optional(),
  parentId: z.string().nullable().optional(),
});

export const GET = withAuth(async (_req, _ctx, user) => {
  const folders = await folderQueries.list({ userId: user.id });
  return ok({ folders });
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const folder = await folderQueries.create({
    userId: user.id,
    data: parsed.data,
  });
  return created(folder);
});