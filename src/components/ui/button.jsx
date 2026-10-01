// src/components/ui/button.jsx
import { forwardRef } from "react";
import { cn } from "@/core/utils/cn";

const VARIANTS = {
  default: [
    "bg-primary text-primary-foreground",
    "hover:bg-primary/90",
    "shadow-sm hover:shadow-[var(--shadow-glow)]",
    "active:scale-[0.98]",
  ].join(" "),
  outline: [
    "border border-border bg-background",
    "hover:bg-accent hover:text-accent-foreground",
    "hover:border-primary/40",
    "active:scale-[0.98]",
  ].join(" "),
  ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
  subtle: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",
  link: "text-primary underline-offset-4 hover:underline",
};

const SIZES = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10",
  "icon-sm": "h-8 w-8",
};

export const Button = forwardRef(function Button(
  { className, variant = "default", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-200 ease-out",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
});