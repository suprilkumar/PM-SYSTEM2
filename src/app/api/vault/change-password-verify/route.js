import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { createHash } from "node:crypto";
import { serverWrapMaster } from "@/modules/vault/lib/server-recovery";
import { z } from "zod";

const verifySchema = z.object({ otp: z.string().length(6) });

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = verifySchema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid OTP");

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s || !s.recoveryOtpHash) return badRequest("No verification in progress");
  if (!s.recoveryOtpExpiresAt || s.recoveryOtpExpiresAt < new Date()) {
    return badRequest("OTP expired");
  }

  const hash = createHash("sha256").update(parsed.data.otp).digest("hex");
  if (hash !== s.recoveryOtpHash) {
    const attempts = (s.recoveryAttempts ?? 0) + 1;
    if (attempts >= 5) {
      await prisma.vaultSettings.update({
        where: { userId: user.id },
        data: { recoveryOtpHash: null, recoveryOtpExpiresAt: null },
      });
      return badRequest("Too many attempts. Start over.");
    }
    await prisma.vaultSettings.update({
      where: { userId: user.id },
      data: { recoveryAttempts: attempts },
    });
    return badRequest("Incorrect OTP");
  }

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: { recoveryOtpHash: null, recoveryOtpExpiresAt: null, recoveryAttempts: 0 },
  });

  return ok({ verified: true });
});