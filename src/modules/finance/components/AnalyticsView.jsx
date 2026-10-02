// src/modules/finance/components/AnalyticsView.jsx
"use client";

import AnalyticsDashboard from "./AnalyticsDashboard";
import { useReports } from "../hooks/useReports";
import { SkeletonStatGrid, SkeletonChart } from "@/components/ui/skeleton";

/**
 * Dashboard-scoped analytics view.
 *
 * Delegates to AnalyticsDashboard so the finance home page and the
 * transactions page render identical analytics — only the range differs.
 */
export default function AnalyticsView({ year, month }) {
  const from = new Date(year, month - 1, 1).toISOString();
  const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

  const { data, loading, error } = useReports("custom", { from, to });

  if (loading && !data) return <AnalyticsSkeleton />;

  if (error) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Couldn't load analytics ({error})
      </p>
    );
  }

  if (!data) return <AnalyticsSkeleton />;

  return <AnalyticsDashboard data={data} loading={false} />;
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonStatGrid />
      <SkeletonChart height={120} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonChart height={280} />
        <SkeletonChart height={280} />
      </div>
      <SkeletonChart height={340} />
    </div>
  );
}