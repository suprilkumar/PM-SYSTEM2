import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";
import {
  deriveKey,
  base64ToBytes,
  bytesToBase64,
  utf8ToBytes,
  concatBytes,
  constantTimeEqual,
  DEFAULT_KDF,
} from "@/modules/vault/crypto/kdf";
import { clearVaultVerified } from "@/core/auth/vault-session";

const schema = z.object({
  confirmText: z.string(),
  pin: z.string().length(6),
});

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid input");
  if (parsed.data.confirmText !== "DELETE MY VAULT") {
    return badRequest("Confirmation text doesn't match");
  }

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s) return badRequest("Vault not configured");

  // Rebuild the KDF params actually used at setup time
  const params = {
    ...DEFAULT_KDF,
    ...(s.kdfParams ?? {}),
    algorithm: s.kdfAlgorithm ?? DEFAULT_KDF.algorithm,
    hash: s.kdfParams?.hash ?? DEFAULT_KDF.hash,
  };

  // If the vault was created with argon2id, a PBKDF2 check will never match.
  if (params.algorithm !== "pbkdf2") {
    return badRequest(
      `PIN verification not supported for KDF "${params.algorithm}"`
    );
  }

  const salt = base64ToBytes(s.pinSalt);
  const info = utf8ToBytes("pin-hash");

  const computed = await deriveKey(
    parsed.data.pin,
    bytesToBase64(concatBytes(salt, info)),
    "", // purpose already folded into salt above
    { ...params, saltMode: "raw" }
  );

  if (!constantTimeEqual(computed, base64ToBytes(s.pinHash))) {
    return badRequest("Incorrect PIN");
  }

  await prisma.$transaction([
    prisma.vaultAudit.deleteMany({ where: { userId: user.id } }),
    prisma.vaultItem.deleteMany({ where: { userId: user.id } }),
    prisma.vaultSettings.delete({ where: { userId: user.id } }),
  ]);

  await clearVaultVerified();
  return ok({ success: true });
});