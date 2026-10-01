// src/modules/notes/lib/validation.js
import { z } from "zod";

const contentSchema = z.object({
  html: z.string().default(""),
  plainText: z.string().default(""),
});

// Reject if both html-stripped and plainText are empty
const notEmpty = (val) => {
  const html = val?.html ?? "";
  const plain = val?.plainText ?? "";
  const stripped = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim();
  return stripped.length > 0 || plain.trim().length > 0;
};

export const noteCreateSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled"),
  content: contentSchema
    .default({ html: "", plainText: "" })
    .refine(notEmpty, { message: "Note content cannot be empty" }),
  plainText: z.string().default(""),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  folderId: z.string().nullable().optional(),
});

export const noteUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: contentSchema.optional(),
  plainText: z.string().optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  folderId: z.string().nullable().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});