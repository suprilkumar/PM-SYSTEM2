// src/modules/notes/lib/editor.js

export function emptyDoc() {
  return { html: "", plainText: "" };
}

export function editorToPlainText(html) {
  if (!html) return "";
  // Strip tags, decode entities, collapse whitespace
  const tmp = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return tmp
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizeContent(content) {
  // Accepts old { blocks: [...] } or new { html, plainText } or null
  if (!content) return emptyDoc();
  if (typeof content === "object" && "html" in content) return content;
  if (typeof content === "object" && "blocks" in content) {
    // Migrate from block format
    const html = (content.blocks || [])
      .map((b) => {
        const t = b.data?.text ?? "";
        switch (b.type) {
          case "h1": return `<h1>${escapeHtml(t)}</h1>`;
          case "h2": return `<h2>${escapeHtml(t)}</h2>`;
          case "code": return `<pre>${escapeHtml(t)}</pre>`;
          case "quote": return `<blockquote>${escapeHtml(t)}</blockquote>`;
          case "bullet": return `<ul><li>${escapeHtml(t)}</li></ul>`;
          case "checklist": return `<p>${b.data?.checked ? "☑" : "☐"} ${escapeHtml(t)}</p>`;
          default: return `<p>${escapeHtml(t)}</p>`;
        }
      })
      .join("");
    return { html, plainText: editorToPlainText(html) };
  }
  return emptyDoc();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}