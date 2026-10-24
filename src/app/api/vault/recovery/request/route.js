import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { randomInt, createHash } from "node:crypto";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  dob: z.string(),
});

const OTP_TTL_MS = 10 * 60 * 1000;

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid input");

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s) return badRequest("Vault not configured");

  // Verify email + DOB
  if (parsed.data.email.toLowerCase() !== s.recoveryEmail.toLowerCase()) {
    return badRequest("Email doesn't match");
  }
  const inputDob = new Date(parsed.data.dob);
  const storedDob = new Date(s.recoveryDob);
  if (
    inputDob.getFullYear() !== storedDob.getFullYear() ||
    inputDob.getMonth() !== storedDob.getMonth() ||
    inputDob.getDate() !== storedDob.getDate()
  ) {
    return badRequest("Date of birth doesn't match");
  }

  // Generate 6-digit OTP
  const otp = String(randomInt(100000, 999999));
  const otpHash = createHash("sha256").update(otp).digest("hex");

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: {
      recoveryOtpHash: otpHash,
      recoveryOtpExpiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  // Send email — use the app's existing email helper
  try {
    const { sendEmail } = await import("@/core/email/send");
    await sendEmail({
      to: s.recoveryEmail,
      subject: "Vault recovery code",
      html: `
        <p>Your vault recovery code:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px; font-family: monospace;">${otp}</h2>
        <p>Valid for 10 minutes. If you didn't request this, ignore this email.</p>
      `,
    });
  } catch (err) {
    console.error("[recovery-email]", err);
    // Still return OK to not leak whether the email sent
  }

  await prisma.vaultAudit.create({
    data: { userId: user.id, action: "recovery_request" },
  });

  return ok({ sent: true });
});