// src/app/api/finance/monthly/route.js
import { unstable_cache } from "next/cache";
import { withAuth } from "@/core/api/handler";
import { okCached } from "@/core/api/response";
import { prisma } from "@/core/db/client";

function makeMonthlyLoader(userId, year) {
  return unstable_cache(
    async () => {
      const from = new Date(year, 0, 1);
      const to = new Date(year, 11, 31, 23, 59, 59, 999);

      const rows = await prisma.$queryRaw`
        SELECT
          EXTRACT(MONTH FROM date)::int AS month,
          type,
          SUM(amount)::float AS total,
          COUNT(*)::int AS count
        FROM finance_transactions
        WHERE "userId" = ${userId}
          AND "deletedAt" IS NULL
          AND date >= ${from}
          AND date <= ${to}
        GROUP BY month, type
        ORDER BY month ASC
      `;

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        income: 0,
        expense: 0,
        net: 0,
        count: 0,
      }));

      for (const row of rows) {
        const m = months[row.month - 1];
        if (row.type === "income") m.income = Number(row.total);
        if (row.type === "expense") m.expense = Number(row.total);
        m.count += Number(row.count);
      }
      for (const m of months) m.net = m.income - m.expense;

      return months;
    },
    // Cache key — includes userId so each user has their own entry
    [`finance-monthly-${userId}-${year}`],
    {
      revalidate: 30,
      tags: [`finance-${userId}`],
    }
  );
}

export const GET = withAuth(async (req, _ctx, user) => {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const months = await makeMonthlyLoader(user.id, year)();

  return okCached({ year, months }, { seconds: 30 });
});