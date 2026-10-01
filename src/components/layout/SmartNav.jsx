// src/components/layout/SmartNav.jsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/core/utils/cn";

/**
 * Wraps any nav content. At scrollTop 0 it's a normal sticky rectangle.
 * Past the threshold, it morphs into a centered floating capsule.
 */
export default function SmartNav({
  children,
  className,
  threshold = 24,
  maxWidth = "max-w-6xl",
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center",
        "transition-all duration-300 ease-out",
        scrolled ? "pt-3" : "pt-0"
      )}
    >
      <div
        className={cn(
          "w-full transition-all duration-300 ease-out",
          maxWidth,
          scrolled
            ? [
                "mx-4 rounded-full border border-border/70",
                "bg-background/85 backdrop-blur-xl",
                "shadow-lg shadow-primary/5",
                "supports-[backdrop-filter]:bg-background/70",
              ].join(" ")
            : ["rounded-none border-b border-border/60", "bg-background/80 backdrop-blur-md"].join(" "),
          className
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center gap-3 px-4 md:px-6 transition-all duration-300",
            scrolled && "h-12 md:px-5"
          )}
        >
          {children}
        </div>
      </div>
    </header>
  );
}