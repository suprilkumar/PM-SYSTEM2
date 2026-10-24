import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { prisma } from "@/core/db/client";

export const GET = withAuth(async (_req, _ctx, user) => {
  const audits = await prisma.vaultAudit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      action: true,
      itemId: true,
      createdAt: true,
      ipAddress: true,
    },
  });
  return ok({ audits });
});