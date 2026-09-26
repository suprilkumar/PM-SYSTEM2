// src/modules/notes/lib/validation.js
import { z } from "zod";

const contentSchema = z.object({
  html: z.string().default(""),
  plainText: z.string().default(""),
});

export const noteCreateSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled"),
  content: contentSchema.default({ html: "", plainText: "" }),
  plainText: z.string().default(""),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const noteUpdateSchema = noteCreateSchema.partial().extend({
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});