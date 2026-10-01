// src/app/api/notes/reorder/route.js
import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { notesQueries } from "@/modules/notes/lib/queries";
import { z } from "zod";

const schema = z.object({
  updates: z.array(
    z.object({ id: z.string(), sortOrder: z.number().int() })
  ),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload");
  await notesQueries.reorder({ userId: user.id, updates: parsed.data.updates });
  return ok({ success: true });
});