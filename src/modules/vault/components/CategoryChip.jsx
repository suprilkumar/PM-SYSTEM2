"use client";

import { CATEGORIES } from "../templates";

export default function CategoryChip({ categoryKey, size = "sm" }) {
  const cat = CATEGORIES[categoryKey] ?? CATEGORIES.custom;
  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizes[size]}`}
      style={{
        backgroundColor: cat.color + "15",
        color: cat.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: cat.color }}
      />
      {cat.label}
    </span>
  );
}