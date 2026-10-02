// src/modules/finance/lib/queries.js
import { prisma } from "@/core/db/client";

/* ────────── CATEGORIES ────────── */

export const categoryQueries = {
  list: ({ userId, includeArchived = false }) =>
    prisma.category.findMany({
      where: { userId, ...(includeArchived ? {} : { isArchived: false }) },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    }),

  byId: ({ userId, id }) =>
    prisma.category.findFirst({ where: { id, userId } }),

  create: ({ userId, data }) =>
    prisma.category.create({ data: { ...data, userId } }),

  update: ({ userId, id, data }) =>
    prisma.category.updateMany({ where: { id, userId }, data }),

  // Blocked if it has children OR transactions
  canDelete: async ({ userId, id }) => {
    const [children, txns] = await Promise.all([
      prisma.category.count({ where: { userId, parentId: id } }),
      prisma.transaction.count({
        where: {
          userId,
          OR: [{ categoryId: id }, { parentCategoryId: id }],
          deletedAt: null,
        },
      }),
    ]);
    return { children, transactions: txns, ok: children === 0 && txns === 0 };
  },

  delete: ({ userId, id }) =>
    prisma.category.deleteMany({ where: { id, userId } }),
};

/* ────────── TRANSACTIONS ────────── */

export const transactionQueries = {
  list: ({ userId, type, categoryId, from, to, search, page = 1, limit = 30 }) =>
    prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(type && { type }),
        ...(categoryId && {
          OR: [{ categoryId }, { parentCategoryId: categoryId }],
        }),
        ...(from || to
          ? { date: { ...(from && { gte: from }), ...(to && { lte: to }) } }
          : {}),
        ...(search && {
          description: { contains: search, mode: "insensitive" },
        }),
      },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        parentCategory: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

  count: ({ userId, type, categoryId, from, to, search }) =>
    prisma.transaction.count({
      where: {
        userId,
        deletedAt: null,
        ...(type && { type }),
        ...(categoryId && {
          OR: [{ categoryId }, { parentCategoryId: categoryId }],
        }),
        ...(from || to
          ? { date: { ...(from && { gte: from }), ...(to && { lte: to }) } }
          : {}),
        ...(search && {
          description: { contains: search, mode: "insensitive" },
        }),
      },
    }),

  byId: ({ userId, id }) =>
    prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        category: true,
        parentCategory: true,
      },
    }),

  create: ({ userId, data }) =>
    prisma.transaction.create({ data: { ...data, userId } }),

  update: ({ userId, id, data }) =>
    prisma.transaction.updateMany({ where: { id, userId }, data }),

  softDelete: ({ userId, id }) =>
    prisma.transaction.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    }),

  /* ────────── REPORTS ────────── */

  aggregateSummary: async ({ userId, from, to, type }) => {
    if (typeof prisma.transaction?.groupBy !== "function") return [];
    try {
      return await prisma.transaction.groupBy({
        by: ["type"],
        where: {
          userId,
          deletedAt: null,
          date: { gte: from, lte: to },
          ...(type && { type }),
        },
        _sum: { amount: true },
      });
    } catch (err) {
      console.error("[finance] aggregateSummary failed:", err.message);
      return [];
    }
  },

  aggregateByCategory: async ({ userId, from, to }) => {
    if (typeof prisma.transaction?.groupBy !== "function") return [];
    try {
      return await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          deletedAt: null,
          date: { gte: from, lte: to },
          type: "expense",
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      });
    } catch (err) {
      console.error("[finance] aggregateByCategory failed:", err.message);
      return [];
    }
  },

  aggregateByDomain: async ({ userId, from, to, type }) => {
    if (typeof prisma.transaction?.groupBy !== "function") return [];
    try {
      return await prisma.transaction.groupBy({
        by: ["parentCategoryId", "type"],
        where: {
          userId,
          deletedAt: null,
          date: { gte: from, lte: to },
          ...(type && { type }),
        },
        _sum: { amount: true },
      });
    } catch (err) {
      console.error("[finance] aggregateByDomain failed:", err.message);
      return [];
    }
  },

  trendRaw: async ({ userId, from, to, type }) => {
    if (typeof prisma.$queryRaw !== "function") return [];
    try {
      return type
        ? await prisma.$queryRaw`
            SELECT
              TO_CHAR(date, 'YYYY-MM') AS period,
              type,
              SUM(amount)::float AS total
            FROM finance_transactions
            WHERE "userId" = ${userId}
              AND "deletedAt" IS NULL
              AND date >= ${from}
              AND date <= ${to}
              AND type = ${type}
            GROUP BY period, type
            ORDER BY period ASC
          `
        : await prisma.$queryRaw`
            SELECT
              TO_CHAR(date, 'YYYY-MM') AS period,
              type,
              SUM(amount)::float AS total
            FROM finance_transactions
            WHERE "userId" = ${userId}
              AND "deletedAt" IS NULL
              AND date >= ${from}
              AND date <= ${to}
            GROUP BY period, type
            ORDER BY period ASC
          `;
    } catch (err) {
      console.error("[finance] trendRaw failed:", err.message);
      return [];
    }
  },
};