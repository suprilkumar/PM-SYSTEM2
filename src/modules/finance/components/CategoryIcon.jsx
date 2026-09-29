// src/modules/finance/components/CategoryIcon.jsx
"use client";
import * as Icons from "lucide-react";
import { cn } from "@/core/utils/cn";

export default function CategoryIcon({ name, className, size = 16 }) {
  const C = Icons[name] ?? Icons.Circle;
  return <C className={cn("shrink-0", className)} style={{ width: size, height: size }} />;
}