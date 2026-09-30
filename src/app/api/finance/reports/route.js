// src/app/api/finance/reports/route.js
import { unstable_cache } from "next/cache";
import { withAuth } from "@/core/api/handler";
import { okCached } from "@/core/api/response";
import { transactionQueries, categoryQueries } from "@/modules/finance/lib/queries";
import { getRange } from "@/modules/finance/lib/dates";

function makeReportsLoader(userId, fromISO, toISO) {
  return unstable_cache(
    async () => {
      const from = new Date(fromISO);
      const to = new Date(toISO);

      const [summaryRaw, byCategoryRaw, byDomainRaw, trendRaw, categories] =
        await Promise.all([
          transactionQueries.aggregateSummary({ userId, from, to }),
          transactionQueries.aggregateByCategory({ userId, from, to }),
          transactionQueries.aggregateByDomain({ userId, from, to }),
          transactionQueries.trendRaw({ userId, from, to }),
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

      const byCategory = byCategoryRaw.map((row) => {
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
      });

      const domainMap = new Map();
      for (const row of byDomainRaw) {
        const key = row.parentCategoryId ?? "__none__";
        if (!domainMap.has(key)) {
          const parentCat = row.parentCategoryId
            ? catMap.get(row.parentCategoryId)
            : null;
          domainMap.set(key, {
            id: key,
            name: parentCat?.name ?? "Uncategorized",
            color: parentCat?.color ?? "#64748b",
            icon: parentCat?.icon ?? "Circle",
            income: 0,
            expense: 0,
          });
        }
        const entry = domainMap.get(key);
        entry[row.type] = Number(row._sum.amount ?? 0);
      }
      const byDomain = Array.from(domainMap.values()).sort(
        (a, b) => b.expense + b.income - (a.expense + a.income)
      );

      const periodMap = new Map();
      for (const row of trendRaw) {
        if (!periodMap.has(row.period)) {
          periodMap.set(row.period, { period: row.period, income: 0, expense: 0 });
        }
        const entry = periodMap.get(row.period);
        entry[row.type] = Number(row.total);
      }
      const trend = Array.from(periodMap.values())
        .sort((a, b) => a.period.localeCompare(b.period))
        .map((t) => ({ ...t, savings: t.income - t.expense }));

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
      };
    },
    [`finance-reports-${userId}-${fromISO}-${toISO}`],
    {
      revalidate: 60,
      tags: [`finance-${userId}`],
    }
  );
}

export const GET = withAuth(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "month";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const { from: defaultFrom, to: defaultTo } = getRange(range);
  const from = fromStr ? new Date(fromStr) : defaultFrom;
  const to = toStr ? new Date(toStr) : defaultTo;

  const payload = await makeReportsLoader(
    user.id,
    from.toISOString(),
    to.toISOString()
  )();

  return okCached(
    { range: { from, to, granularity: range }, ...payload },
    { seconds: 30 }
  );
});