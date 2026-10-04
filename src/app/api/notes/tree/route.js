// src/app/api/notes/tree/route.js — add at the top of the handler
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { notesQueries, folderQueries } from "@/modules/notes/lib/queries";
import { prisma } from "@/core/db/client";

const RETENTION_DAYS = 30;

export const GET = withAuth(async (_req, _ctx, user) => {
  // Silent auto-purge — cheap, indexes on (userId, deletedAt)
  await prisma.note.deleteMany({
    where: {
      userId: user.id,
      deletedAt: { lt: new Date(Date.now() - RETENTION_DAYS * 864e5) },
    },
  });

  const [notes, folders] = await Promise.all([
    notesQueries.listTree({ userId: user.id }),
    folderQueries.list({ userId: user.id }),
  ]);
  return ok({ notes, folders });
});