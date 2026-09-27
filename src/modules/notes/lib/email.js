// src/modules/notes/lib/email.js
import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null; // fall back to console logging
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

export async function sendShareEmail({ to, fromName, noteTitle, token, role }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`;

  const t = getTransporter();
  if (!t) {
    console.log(
      `[share-email] (no SMTP configured)\n  To: ${to}\n  Link: ${url}\n  Note: "${noteTitle}" (${role})`
    );
    return { ok: true, mode: "logged" };
  }

  try {
    await t.sendMail({
      from: `"Personal Suite" <${process.env.GMAIL_USER}>`,
      to,
      subject: `${fromName} shared "${noteTitle}" with you`,
      text: `${fromName} shared a note with you: "${noteTitle}"\n\nOpen: ${url}\n\nSign in with ${to} to view. Link expires in 30 days.`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 8px">${escapeHtml(fromName)} shared a note with you</h2>
          <p style="color:#475569;margin:0 0 20px">
            "${escapeHtml(noteTitle)}" — you have <strong>${role}</strong> access.
          </p>
          <a href="${url}"
             style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">
            Open note
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            Or paste this in your browser: ${url}
          </p>
          <p style="color:#94a3b8;font-size:12px">
            Sign in with <strong>${escapeHtml(to)}</strong> to view. Link expires in 30 days.
          </p>
        </div>
      `,
    });
    console.log(`[share-email] sent to ${to}`);
    return { ok: true, mode: "sent" };
  } catch (err) {
    console.error("[share-email] SMTP failed:", err?.message ?? err);
    console.log(`[share-email] fallback link → ${url}`);
    return { ok: false, mode: "fallback", url };
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}