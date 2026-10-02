// src/components/ui/skeleton.jsx
import { cn } from "@/core/utils/cn";

export function Skeleton({ className, ...props }) {
  return <div className={cn("skeleton", className)} {...props} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/70 bg-card p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-28" />
          <Skeleton className="mt-2 h-2.5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 8 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex gap-6">
          {[80, 140, 180, 100, 90, 80].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 border-b border-border/50 px-4 py-3 last:border-0"
        >
          <Skeleton className="h-3 w-[80px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <Skeleton className="h-3 w-[150px]" />
          <Skeleton className="h-3 w-[70px]" />
          <Skeleton className="ml-auto h-3 w-[90px]" />
          <Skeleton className="h-3 w-[60px]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 280 }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 w-full rounded-xl" style={{ height }} />
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/70 bg-card p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-5/6" />
          <Skeleton className="mt-4 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}