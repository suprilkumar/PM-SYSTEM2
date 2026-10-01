// src/app/api/notes/route.js
import { withAuth } from "@/core/api/handler";
import { ok, created, badRequest } from "@/core/api/response";
import { notesQueries } from "@/modules/notes/lib/queries";
import { noteCreateSchema } from "@/modules/notes/lib/validation";

export const GET = withAuth(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);
  const search = searchParams.get("search") ?? "";
  const archived = searchParams.get("archived") === "true";

  const [notes, total] = await Promise.all([
    notesQueries.list({ userId: user.id, search, archived, page, limit }),
    notesQueries.count({ userId: user.id, archived }),
  ]);

  return ok({ notes, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = noteCreateSchema.safeParse(body);
  if (!parsed.success) {
    // Detect the specific "empty" error and return a friendly message
    const isEmpty = parsed.error.issues.some(
      (i) => i.message === "Note content cannot be empty"
    );
    return badRequest(
      isEmpty ? "Note content cannot be empty" : "Invalid note",
      parsed.error.flatten()
    );
  }
  if (!parsed.success) return badRequest("Invalid note", parsed.error.flatten());

  // src/app/api/notes/route.js — POST
  const note = await notesQueries.create({
    userId: user.id,
    data: {
      ...parsed.data,
      folderId: parsed.data.folderId ?? null,
    },
  });
  return created(note);
});