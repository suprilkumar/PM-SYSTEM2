// src/app/api/shares/[token]/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/core/auth/session";
import { prisma } from "@/core/db/client";

export async function GET(_req, ctx) {
  const { token } = await ctx.params;

  const share = await prisma.noteShare.findUnique({
    where: { token },
    include: {
      note: {
        select: {
          id: true,
          title: true,
          content: true,
          updatedAt: true,
          deletedAt: true,
        },
      },
      owner: { select: { name: true, image: true, email: true } },
    },
  });

  if (!share) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
  }
  if (share.status === "revoked") {
    return NextResponse.json({ error: "Access revoked" }, { status: 403 });
  }
  if (share.expiresAt && share.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link expired" }, { status: 410 });
  }
  if (share.note.deletedAt) {
    return NextResponse.json({ error: "Note no longer available" }, { status: 404 });
  }

  // Must be signed in
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to view", requiresAuth: true, shareEmail: share.email },
      { status: 401 }
    );
  }

  // Must be signed in as the invited email
  if (user.email.toLowerCase() !== share.email.toLowerCase()) {
    return NextResponse.json(
      {
        error: "This note was shared with a different email",
        expectedEmail: share.email,
        yourEmail: user.email,
      },
      { status: 403 }
    );
  }

  // Mark accepted on first open
  if (share.status === "pending") {
    await prisma.noteShare.update({
      where: { id: share.id },
      data: { status: "accepted", acceptedAt: new Date() },
    });
  }

  return NextResponse.json({
    note: {
      id: share.note.id,
      title: share.note.title,
      content: share.note.content,
      updatedAt: share.note.updatedAt,
    },
    owner: share.owner,
    role: share.role,
  });
}