import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { z } from "zod";
import { pbkdf2 } from "@noble/hashes/pbkdf2.js";
import { sha512 } from "@noble/hashes/sha512.js";
import {
  base64ToBytes,
  bytesToBase64,
  utf8ToBytes,
  concatBytes,
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

  // Verify PIN as final proof of ownership
  const salt = base64ToBytes(s.pinSalt);
  const info = utf8ToBytes("pin-hash");
  const computed = pbkdf2(
    sha512,
    utf8ToBytes(parsed.data.pin),
    concatBytes(salt, info),
    { c: s.kdfParams.iterations, dkLen: s.kdfParams.dkLen }
  );
  if (bytesToBase64(computed) !== s.pinHash) {
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