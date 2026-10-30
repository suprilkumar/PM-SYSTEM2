// src/core/email/send.js
import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ""),
    },
  });
  return transporter;
}

/**
 * Send an email. Falls back to console logging if SMTP is not configured.
 * Never throws — always returns a result object.
 */
export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();

  if (!t) {
    console.log(
      `[email] (no SMTP configured)\n  To: ${to}\n  Subject: ${subject}\n  Text: ${text ?? ""}`
    );
    return { ok: true, mode: "logged" };
  }

  try {
    await t.sendMail({
      from: `"Personal Suite" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`[email] sent to ${to}`);
    return { ok: true, mode: "sent" };
  } catch (err) {
    console.error("[email] SMTP failed:", err?.message ?? err);
    console.log(`[email] fallback content —\n  To: ${to}\n  Subject: ${subject}\n  Text: ${text ?? ""}`);
    return { ok: false, mode: "fallback", error: err?.message };
  }
}

/** Utility — escape user-supplied strings before embedding in HTML. */
export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}