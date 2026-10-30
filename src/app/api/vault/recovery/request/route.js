import { withAuth } from "@/core/api/handler";
import { ok, badRequest } from "@/core/api/response";
import { prisma } from "@/core/db/client";
import { randomInt, createHash } from "node:crypto";
import { z } from "zod";
import { sendEmail, escapeHtml } from "@/core/email/send";

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
  subject: "Your vault recovery code",
  text: `Your vault recovery code is: ${otp}\n\nValid for 10 minutes.`,
  html: `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 8px">Vault recovery code</h2>
      <p style="color:#475569;margin:0 0 20px">
        Use this code to recover your vault.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 20px">
        <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:32px;letter-spacing:8px;font-weight:600;color:#0f172a">
          ${otp}
        </div>
      </div>
      <p style="color:#475569;font-size:14px;margin:0 0 8px">
        Expires in <strong>10 minutes</strong>.
      </p>
      <p style="color:#94a3b8;font-size:12px;margin:24px 0 0">
        If you didn't request recovery, your account may be compromised.
      </p>
    </div>
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