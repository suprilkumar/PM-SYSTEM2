// src/app/api/public/notes/[slug]/route.js
import { NextResponse } from "next/server";
import { notesQueries } from "@/modules/notes/lib/queries";

export async function GET(_req, ctx) {
  const { slug } = await ctx.params;
  const note = await notesQueries.byPublicSlug(slug);
  if (!note) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  await notesQueries.incrementView(slug);
  return NextResponse.json(note);
}