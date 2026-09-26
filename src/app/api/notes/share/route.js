// src/app/api/notes/share/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { generateSlug } from "@/modules/notes/lib/slug";

export const POST = withAuth(async (req, _ctx, user) => {
  const { noteId, enable } = await req.json();

  const note = await prisma.note.findFirst({ where: { id: noteId, userId: user.id } });
  if (!note) return ok({ error: "Not found" }, { status: 404 });

  const publicSlug = enable ? note.publicSlug ?? generateSlug() : null;
  await prisma.note.update({
    where: { id: noteId },
    data: { isPublic: enable, publicSlug },
  });

  return ok({ isPublic: enable, publicSlug });
});