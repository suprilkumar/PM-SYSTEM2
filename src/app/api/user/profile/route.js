// src/app/api/user/profile/route.js
import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(80),
});

export const PATCH = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload");

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });
  return ok({ success: true });
});