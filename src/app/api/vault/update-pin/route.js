import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";

const schema = z.object({
  pinHash: z.string().min(1),
  pinSalt: z.string().min(1),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload");

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: { pinHash: parsed.data.pinHash, pinSalt: parsed.data.pinSalt },
  });

  return ok({ success: true });
});