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

// src/modules/notes/lib/editor.js — add:
export function extractTitleFromHtml(html) {
  if (!html) return "";
  // Prefer the first heading
  const headingMatch = html.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
  if (headingMatch) return stripTags(headingMatch[1]).trim();

  // Otherwise use the first paragraph
  const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (pMatch) return stripTags(pMatch[1]).trim().slice(0, 120);

  // Fallback: first line of text
  const text = stripTags(html).split("\n")[0] ?? "";
  return text.trim().slice(0, 120);
}

function stripTags(s) {
  return String(s)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** True if the editor content is effectively empty (no visible text). */
export function isEditorEmpty(html) {
  if (!html) return true;
  // Strip tags, whitespace, and known empty-only markers
  const text = String(html)
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "");
  return text.length === 0;
}

/** Compute the effective title: explicit title → first line of content → "". */
export function resolveTitle(title, html) {
  const trimmed = (title ?? "").trim();
  if (trimmed) return trimmed;
  const fromContent = extractTitleFromHtml(html);
  return (fromContent ?? "").trim();
}