// src/app/api/finance/dashboard/route.js
import { withAuth } from "@/core/api/handler";
import { ok } from "@/core/api/response";
import { transactionQueries } from "@/modules/finance/lib/queries";
import { getRange } from "@/modules/finance/lib/dates";

export const GET = withAuth(async (_req, _ctx, user) => {
  const { from, to } = getRange("month");

  const [summaryRaw, recentTxns] = await Promise.all([
    transactionQueries.aggregateSummary({ userId: user.id, from, to }),
    transactionQueries.list({ userId: user.id, page: 1, limit: 5 }),
  ]);

  const totalIncome = Number(
    summaryRaw.find((r) => r.type === "income")?._sum?.amount ?? 0
  );
  const totalExpense = Number(
    summaryRaw.find((r) => r.type === "expense")?._sum?.amount ?? 0
  );

  return ok({
    month: { from, to },
    summary: {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    },
    recentTransactions: recentTxns,
  });
});