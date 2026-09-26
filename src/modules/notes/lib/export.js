// src/modules/notes/lib/export.js
import { editorToPlainText } from "./editor";

export async function exportNote(note, format) {
  if (format === "txt") {
    const text = `# ${note.title}\n\n${note.plainText || editorToPlainText(note.content)}`;
    return {
      buffer: Buffer.from(text, "utf8"),
      contentType: "text/plain; charset=utf-8",
      filename: `${sanitize(note.title)}.txt`,
    };
  }
  // PDF/PNG generated client-side (jsPDF + html2canvas) — return placeholder
  throw new Error("PDF/PNG generated client-side");
}

const sanitize = (s) => s.replace(/[^a-z0-9-_]+/gi, "_").slice(0, 40) || "note";