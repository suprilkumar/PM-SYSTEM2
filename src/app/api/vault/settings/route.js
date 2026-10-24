// src/app/api/vault/settings/route.js
import { withAuth } from "@/core/api/handler";
import { ok, created, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { serverWrapMaster } from "@/modules/vault/lib/server-recovery";
import { z } from "zod";

const setupSchema = z.object({
  kdfSalt: z.string().min(1),
  kdfAlgorithm: z.enum(["argon2id", "pbkdf2"]),
  kdfParams: z.record(z.any()),
  wrappedByPassword: z.string().min(1),
  wrappedByPasswordNonce: z.string().min(1),
  wrappedByPin: z.string().min(1),
  wrappedByPinNonce: z.string().min(1),
  wrappedAlgorithm: z.string().default("xchacha20-poly1305"),
  checkValue: z.string().min(1),
  checkNonce: z.string().min(1),
  pinHash: z.string().min(1),
  pinSalt: z.string().min(1),
  recoveryEmail: z.string().email(),
  recoveryDob: z.string(), // ISO date
  masterKeyBase64: z.string().min(1), // ONLY sent during setup for server-recovery
});

export const POST = withAuth(async (req, _ctx, user) => {
  const body = await req.json();
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

  const existing = await prisma.vaultSettings.findUnique({
    where: { userId: user.id },
  });
  if (existing) return badRequest("Vault already set up");

  // Verify the recovery email matches the user's actual signed-in email
  if (parsed.data.recoveryEmail.toLowerCase() !== user.email.toLowerCase()) {
    return badRequest("Recovery email must match your signed-in email");
  }

  const { masterKeyBase64, ...rest } = parsed.data;
  const serverRecovery = serverWrapMaster(masterKeyBase64);

  const settings = await prisma.vaultSettings.create({
    data: {
      ...rest,
      recoveryDob: new Date(rest.recoveryDob),
      serverRecoveryBlob: serverRecovery.ciphertext,
      serverRecoveryNonce: serverRecovery.nonce,
      userId: user.id,
    },
  });

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "setup" },
  });

  return created({ id: settings.id });
});

export const GET = withAuth(async (_req, _ctx, user) => {
  const s = await prisma.vaultSettings.findUnique({
    where: { userId: user.id },
    select: {
      kdfSalt: true,
      kdfAlgorithm: true,
      kdfParams: true,
      wrappedByPassword: true,
      wrappedByPasswordNonce: true,
      wrappedByPin: true,
      wrappedByPinNonce: true,
      wrappedAlgorithm: true,
      checkValue: true,
      checkNonce: true,
      recoveryEmail: true,
    },
  });
  if (!s) return ok({ configured: false });
  return ok({ configured: true, ...s });
});