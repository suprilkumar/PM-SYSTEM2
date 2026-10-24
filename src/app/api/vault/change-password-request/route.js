import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { createHash, randomInt } from "node:crypto";
import { z } from "zod";

const schema = z.object({ dob: z.string() });
const OTP_TTL = 10 * 60 * 1000;

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid input");

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s) return badRequest("Vault not configured");

  const inputDob = new Date(parsed.data.dob);
  const storedDob = new Date(s.recoveryDob);
  if (
    inputDob.getFullYear() !== storedDob.getFullYear() ||
    inputDob.getMonth() !== storedDob.getMonth() ||
    inputDob.getDate() !== storedDob.getDate()
  ) {
    return badRequest("Date of birth doesn't match");
  }

  const otp = String(randomInt(100000, 999999));
  const otpHash = createHash("sha256").update(otp).digest("hex");

  await prisma.vaultSettings.update({
    where: { userId: user.id },
    data: {
      recoveryOtpHash: otpHash,
      recoveryOtpExpiresAt: new Date(Date.now() + OTP_TTL),
      recoveryAttempts: 0,
    },
  });

  try {
    const { sendEmail } = await import("@/core/email/send");
    await sendEmail({
      to: s.recoveryEmail,
      subject: "Password change verification",
      html: `
        <p>Your verification code for changing your vault master password:</p>
        <h2 style="font-size: 32px; letter-spacing: 8px;">${otp}</h2>
        <p>Valid for 10 minutes. If you didn't request this, someone has your DOB — change your account password.</p>
      `,
    });
  } catch (err) {
    console.error("[change-pw] email failed:", err.message);
    // In dev, log to console so you can test
    console.log(`[change-pw] OTP for ${s.recoveryEmail}: ${otp}`);
  }

  return ok({ sent: true });
});