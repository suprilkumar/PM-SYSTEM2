// src/app/api/finance/reports/route.js
import { unstable_cache } from "next/cache";
import { withAuth } from "@/core/api/handler";
import { okCached } from "@/core/api/response";
import { transactionQueries, categoryQueries } from "@/modules/finance/lib/queries";
import { resolveRange } from "@/modules/finance/lib/dates";

function makeReportsLoader(userId, fromISO, toISO, type) {
  return unstable_cache(
    async () => {
      const from = new Date(fromISO);
      const to = new Date(toISO);

      const [summaryRaw, byCategoryRaw, byDomainRaw, trendRaw, weekdayRaw, categories] =
        await Promise.all([
          transactionQueries.aggregateSummary({ userId, from, to, type }),
          transactionQueries.aggregateByCategory({
            userId,
            from,
            to,
            type: type ?? "expense",
          }),
          transactionQueries.aggregateByDomain({ userId, from, to, type }),
          transactionQueries.trendRaw({ userId, from, to, type }),
          transactionQueries.weekdayRaw({ userId, from, to, type }),
          categoryQueries.list({ userId }),
        ]);

      const totalIncome = Number(
        summaryRaw.find((r) => r.type === "income")?._sum?.amount ?? 0
      );
      const totalExpense = Number(
        summaryRaw.find((r) => r.type === "expense")?._sum?.amount ?? 0
      );
      const netSavings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

      const catMap = new Map(categories.map((c) => [c.id, c]));

      const weekday = weekdayRaw.map((row) => ({
        weekday: row.weekday,
        expense: Number(row.total),
        }));

      // ── By category (leaf) ──
      const byCategory = byCategoryRaw
        .map((row) => {
          const cat = catMap.get(row.categoryId);
          const total = Number(row._sum.amount ?? 0);
          return {
            categoryId: row.categoryId,
            name: cat?.name ?? "Unknown",
            icon: cat?.icon ?? "Circle",
            color: cat?.color ?? "#64748b",
            total,
            percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
          };
        })
        .filter((c) => c.total > 0);

      // ── By domain (parent, or self if root) ──
      const domainTotals = new Map();
      for (const row of byDomainRaw) {
        if (!domainTotals.has(row.domainId)) {
          domainTotals.set(row.domainId, { income: 0, expense: 0 });
        }
        const entry = domainTotals.get(row.domainId);
        entry[row.type] = (entry[row.type] ?? 0) + Number(row[row.type] ?? 0);
      }

      const byDomain = Array.from(domainTotals.entries())
        .map(([id, totals]) => {
          const cat = catMap.get(id);
          return {
            id,
            name: cat?.name ?? "Uncategorized",
            color: cat?.color ?? "#64748b",
            icon: cat?.icon ?? "Circle",
            income: totals.income,
            expense: totals.expense,
          };
        })
        .filter((d) => d.income > 0 || d.expense > 0)
        .sort((a, b) => b.expense + b.income - (a.expense + a.income));

      // ── Trend ──
      const periodMap = new Map();
      for (const row of trendRaw) {
        if (!periodMap.has(row.period)) {
          periodMap.set(row.period, {
            period: row.period,
            income: 0,
            expense: 0,
          });
        }
        const entry = periodMap.get(row.period);
        entry[row.type] = Number(row.total);
      }
      const trend = Array.from(periodMap.values())
        .sort((a, b) => a.period.localeCompare(b.period))
        .map((t) => ({ ...t, savings: t.income - t.expense }));

      // ── Top categories ──
      const topCategories = byCategory.slice(0, 5).map((c) => ({
        name: c.name,
        total: c.total,
        share: c.percentage,
      }));

      return {
        summary: { totalIncome, totalExpense, netSavings, savingsRate },
        byCategory,
        byDomain,
        trend,
        topCategories,
        weekday,
      };
    },
    [`finance-reports-${userId}-${fromISO}-${toISO}-${type ?? "all"}`],
    {
      revalidate: 60,
      tags: [`finance-${userId}`],
    }
  );
}

export const GET = withAuth(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const preset = searchParams.get("range") ?? "this-month";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const typeFilter = searchParams.get("type") || null;

  // Explicit from/to wins, else resolve from preset
  let range;
  if (fromStr && toStr) {
    range = { from: new Date(fromStr), to: new Date(toStr) };
  } else {
    range = resolveRange({ preset });
  }

  const payload = await makeReportsLoader(
    user.id,
    range.from.toISOString(),
    range.to.toISOString(),
    typeFilter
  )();

  return okCached(
    {
      range: { from: range.from, to: range.to, granularity: preset },
      ...payload,
    },
    { seconds: 30 }
  );
});