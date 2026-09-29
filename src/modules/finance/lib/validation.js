// src/modules/finance/lib/validation.js
import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(60),
  type: z.enum(["income", "expense"]),
  parentId: z.string().nullable().optional(),
  icon: z.string().max(40).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  icon: z.string().max(40).optional(),
  isArchived: z.boolean().optional(),
});

export const transactionCreateSchema = z.object({
  amount: z.coerce.number().positive().max(1e10),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1),
  date: z.coerce.date(),
  description: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? undefined : v.trim() || undefined))
    .optional(),
  paymentMethod: z
    .enum(["cash", "upi", "card", "netbanking", "bank transfer", "neft/rtgs", "other"])
    .default("other"),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.any().optional(),
  metadata: z.record(z.any()).optional(),
});

export const transactionUpdateSchema = transactionCreateSchema.partial();

export const reportQuerySchema = z.object({
  range: z.enum(["month", "quarter", "year", "last6", "all"]).default("month"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});