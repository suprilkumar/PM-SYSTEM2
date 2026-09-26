// src/modules/notes/lib/queries.js
import { prisma } from "@/core/db/client";

export const notesQueries = {
  list: ({ userId, search = "", archived = false, page = 1, limit = 20 }) =>
    prisma.note.findMany({
      where: {
        userId,
        deletedAt: null,
        isArchived: archived,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { plainText: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),

  count: ({ userId, archived = false }) =>
    prisma.note.count({ where: { userId, deletedAt: null, isArchived: archived } }),

  byId: ({ userId, id }) =>
    prisma.note.findFirst({ where: { id, userId, deletedAt: null } }),

  create: ({ userId, data }) => prisma.note.create({ data: { ...data, userId } }),

  update: ({ userId, id, data }) =>
    prisma.note.updateMany({ where: { id, userId }, data }),

  softDelete: ({ userId, id }) =>
    prisma.note.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    }),

  byPublicSlug: (slug) =>
    prisma.note.findFirst({
      where: { publicSlug: slug, isPublic: true, deletedAt: null },
      select: {
        id: true, title: true, content: true, viewCount: true,
        updatedAt: true, user: { select: { name: true, image: true } },
      },
    }),

  incrementView: (slug) =>
    prisma.note.updateMany({
      where: { publicSlug: slug, isPublic: true },
      data: { viewCount: { increment: 1 } },
    }),
};