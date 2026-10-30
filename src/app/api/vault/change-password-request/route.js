// src/app/api/vault/change-password-request/route.js
import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { createHash, randomInt } from "node:crypto";
import { sendEmail, escapeHtml } from "@/core/email/send";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  dob: z.string(),
});

const OTP_TTL = 10 * 60 * 1000;

export const POST = withAuth(async (req, _ctx, user) => {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return badRequest("Invalid input");

  const s = await prisma.vaultSettings.findUnique({ where: { userId: user.id } });
  if (!s) return badRequest("Vault not configured");

  // Verify email matches the stored recovery email
  if (parsed.data.email.toLowerCase() !== s.recoveryEmail.toLowerCase()) {
    return badRequest("Recovery email doesn't match");
  }

  // Verify DOB
  const inputDob = new Date(parsed.data.dob);
  const storedDob = new Date(s.recoveryDob);
  if (
    inputDob.getFullYear() !== storedDob.getFullYear() ||
    inputDob.getMonth() !== storedDob.getMonth() ||
    inputDob.getDate() !== storedDob.getDate()
  ) {
    return badRequest("Date of birth doesn't match");
  }

  // Generate OTP
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

  // Send the OTP
  const safeEmail = escapeHtml(s.recoveryEmail);
  const expiresIn = Math.round(OTP_TTL / 60000);

  await sendEmail({
    to: s.recoveryEmail,
    subject: "Your vault password change code",
    text: `Your vault password change code is: ${otp}\n\nValid for ${expiresIn} minutes.\nIf you didn't request this, ignore this email.`,
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 8px">Verify your identity</h2>
        <p style="color:#475569;margin:0 0 20px">
          Use the code below to change your vault master password.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 20px">
          <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:32px;letter-spacing:8px;font-weight:600;color:#0f172a">
            ${otp}
          </div>
        </div>
        <p style="color:#475569;font-size:14px;margin:0 0 8px">
          This code expires in <strong>${expiresIn} minutes</strong>.
        </p>
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0">
          Sent to ${safeEmail}. If you didn't request this change, someone has
          your recovery email and DOB — change your account password immediately.
        </p>
      </div>
    `,
  });

  try {
    await prisma.vaultAudit.create({
      data: { userId: user.id, action: "recovery_request" },
    });
  } catch {}

  return ok({ sent: true });
});