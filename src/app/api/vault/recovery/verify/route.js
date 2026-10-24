import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { createHash } from "node:crypto";
import { serverUnwrapMaster } from "@/modules/vault/lib/server-recovery";
import { z } from "zod";

const schema = z.object({ otp: z.string().length(6) });

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid OTP format");

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s) return badRequest("Vault not configured");
  if (!s.recoveryOtpHash) return badRequest("No recovery in progress");
  if (!s.recoveryOtpExpiresAt || s.recoveryOtpExpiresAt < new Date()) {
    return badRequest("OTP expired");
  }

  const hash = createHash("sha256").update(parsed.data.otp).digest("hex");
  if (hash !== s.recoveryOtpHash) {
    const attempts = s.recoveryAttempts + 1;
    if (attempts >= 5) {
      await prisma.vaultSettings.update({
        where: { userId: user.id },
        data: { recoveryOtpHash: null, recoveryOtpExpiresAt: null, recoveryAttempts: 0 },
      });
      return badRequest("Too many failed attempts. Start over.");
    }
    await prisma.vaultSettings.update({
      where: { userId: user.id },
      data: { recoveryAttempts: attempts },
    });
    return badRequest("Incorrect OTP");
  }

  // Clear OTP state
  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: { recoveryOtpHash: null, recoveryOtpExpiresAt: null, recoveryAttempts: 0 },
  });

  // Decrypt master key using the server-held secret
  if (!s.serverRecoveryBlob || !s.serverRecoveryNonce) {
    return badRequest("Recovery envelope missing");
  }
  const masterKeyBase64 = serverUnwrapMaster({
    ciphertext: s.serverRecoveryBlob,
    nonce: s.serverRecoveryNonce,
  });

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "recovery_verified" },
  });

  // Return master key to client so it can re-wrap with new credentials
  // This is the ONE moment the plaintext master key touches the wire —
  // only over HTTPS, only after OTP verification, only once.
  return ok({ masterKeyBase64 });
});