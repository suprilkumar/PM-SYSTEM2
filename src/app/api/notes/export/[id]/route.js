// src/app/api/notes/export/[id]/route.js
import { withAuth } from "@/core/api/handler";
import { notFound, badRequest } from "@/core/api/response";
import { notesQueries } from "@/modules/notes/lib/queries";
import { exportNote } from "@/modules/notes/lib/export";

export const GET = withAuth(async (req, { params }, user) => {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") ?? "txt";
  if (!["pdf", "png", "txt"].includes(format)) return badRequest("Unsupported format");

  const note = await notesQueries.byId({ userId: user.id, id: params.id });
  if (!note) return notFound();

  const { buffer, contentType, filename } = await exportNote(note, format);
  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});