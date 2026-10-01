// src/app/api/notes/tree/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { notesQueries, folderQueries } from "@/modules/notes/lib/queries";

export const GET = withAuth(async (_req, _ctx, user) => {
  const [notes, folders] = await Promise.all([
    notesQueries.listTree({ userId: user.id }),
    folderQueries.list({ userId: user.id }),
  ]);
  return ok({ notes, folders });
});