// src/app/api/finance/reports/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { transactionQueries, categoryQueries } from "@/modules/finance/lib/queries";
import { getRange } from "@/modules/finance/lib/dates";

export const GET = withAuth(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") ?? "month";
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const { from: defaultFrom, to: defaultTo } = getRange(range);
  const from = fromStr ? new Date(fromStr) : defaultFrom;
  const to = toStr ? new Date(toStr) : defaultTo;

  const [summaryRaw, byCategoryRaw, byDomainRaw, trendRaw, categories] = await Promise.all([
    transactionQueries.aggregateSummary({ userId: user.id, from, to }),
    transactionQueries.aggregateByCategory({ userId: user.id, from, to }),
    transactionQueries.aggregateByDomain({ userId: user.id, from, to }),
    transactionQueries.trendRaw({ userId: user.id, from, to }),
    categoryQueries.list({ userId: user.id }),
  ]);

  // Summary
  const totalIncome = Number(
    summaryRaw.find((r) => r.type === "income")?._sum?.amount ?? 0
  );
  const totalExpense = Number(
    summaryRaw.find((r) => r.type === "expense")?._sum?.amount ?? 0
  );
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category map
  const catMap = new Map(categories.map((c) => [c.id, c]));

  // By category (leaf level)
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

  // By domain (parent level)
  const domainMap = new Map();
  for (const row of byDomainRaw) {
    const key = row.parentCategoryId ?? "__none__";
    if (!domainMap.has(key)) {
      const parentCat = row.parentCategoryId ? catMap.get(row.parentCategoryId) : null;
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

  // Trend (fill missing periods with zeros)
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

  // Top categories
  const topCategories = byCategory.slice(0, 5).map((c) => ({
    name: c.name,
    total: c.total,
    share: c.percentage,
  }));

  return ok({
    range: { from, to, granularity: range },
    summary: { totalIncome, totalExpense, netSavings, savingsRate },
    byCategory,
    byDomain,
    trend,
    topCategories,
  });
});