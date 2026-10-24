"use client";

import * as Icons from "lucide-react";
import { TEMPLATES } from "../templates";

export default function ServiceLogo({ templateKey, size = 36 }) {
  const t = TEMPLATES[templateKey];
  const color = t?.color ?? "#64748b";

  // 1. Custom SVG in /public/vault-logos/
  if (t?.customLogo) {
    return (
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border/60"
        style={{ width: size, height: size }}
      >
        <img
          src={`/vault-logos/${templateKey}.svg`}
          alt={t.label}
          width={size * 0.72}
          height={size * 0.72}
          loading="lazy"
          onError={(e) => {
            // Fall back to Lucide if the SVG is missing
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.dataset.fallback = "1";
          }}
        />
        {/* Fallback icon shown only if img fails */}
        <FallbackIcon template={t} size={size} />
      </span>
    );
  }

  // 2. Simple Icons CDN
  if (t?.logo) {
    return (
      <span
        className="grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border/60"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://cdn.simpleicons.org/${t.logo}/${encodeURIComponent(
            color.replace("#", "")
          )}`}
          alt={t.label}
          width={size * 0.6}
          height={size * 0.6}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.dataset.fallback = "1";
          }}
        />
        <FallbackIcon template={t} size={size} hidden />
      </span>
    );
  }

  // 3. Lucide fallback
  return <FallbackIcon template={t} size={size} />;
}

function FallbackIcon({ template, size, hidden = false }) {
  const Icon = Icons[template?.icon] ?? Icons.FileKey;
  const color = template?.color ?? "#64748b";
  return (
    <span
      className={hidden ? "hidden" : "grid shrink-0 place-items-center rounded-xl"}
      style={{
        width: size,
        height: size,
        backgroundColor: color + "20",
        color,
      }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}