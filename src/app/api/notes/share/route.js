// src/app/api/notes/share/route.js
import { withAuth } from "@/core/api/handler";
import { ok, badRequest, notFound } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { generateSlug } from "@/modules/notes/lib/slug";
import { sendShareEmail } from "@/modules/notes/lib/email";
import { z } from "zod";

const publicSchema = z.object({
  mode: z.literal("public"),
  noteId: z.string().min(1),
  enable: z.boolean(),
});

const emailSchema = z.object({
  mode: z.literal("email"),
  noteId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["viewer", "editor"]).default("viewer"),
});

const bodySchema = z.discriminatedUnion("mode", [publicSchema, emailSchema]);

export const POST = withAuth(async (req, _ctx, user) => {
  let json;
  try {
    json = await req.json();
  } catch {
    return badRequest("Invalid JSON");
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    console.error("[share] validation failed:", parsed.error.flatten(), json);
    return badRequest("Invalid payload", parsed.error.flatten());
  }

  const { mode, noteId } = parsed.data;

  const note = await prisma.note.findFirst({
    where: { id: noteId, userId: user.id, deletedAt: null },
  });
  if (!note) return notFound();

  if (mode === "public") {
    const { enable } = parsed.data;
    const publicSlug = enable ? note.publicSlug ?? generateSlug() : null;

    const updated = await prisma.note.update({
      where: { id: note.id },
      data: { isPublic: enable, publicSlug },
    });

    return ok({
      isPublic: updated.isPublic,
      publicSlug: updated.publicSlug,
      url: updated.publicSlug ? `/notes/public/${updated.publicSlug}` : null,
    });
  }

  // mode === "email"
  const { email, role } = parsed.data;

  if (email.toLowerCase() === user.email.toLowerCase()) {
    return badRequest("You can't share a note with yourself");
  }

  const token = generateSlug();

  const share = await prisma.noteShare.upsert({
    where: { noteId_email: { noteId: note.id, email: email.toLowerCase() } },
    create: {
      noteId: note.id,
      ownerId: user.id,
      email: email.toLowerCase(),
      token,
      role,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {
      token,
      role,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Fire-and-forget email
  sendShareEmail({
    to: email,
    fromName: user.name ?? "Someone",
    noteTitle: note.title,
    token: share.token,
    role,
  }).catch((err) => console.error("[share email]", err));

  return ok({
    id: share.id,
    email: share.email,
    token: share.token,
    role: share.role,
    status: share.status,
    url: `/share/${share.token}`,
  });
});