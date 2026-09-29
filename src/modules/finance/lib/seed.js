// src/modules/finance/lib/seed.js
import { prisma } from "@/core/db/client";
import { DEFAULT_CATEGORIES } from "../constants";

/**
 * Seeds pre-built categories for a user, once.
 * Idempotent: if the user already has categories, does nothing.
 */
export async function seedCategoriesIfEmpty(userId) {
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) return { seeded: false };

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const top = DEFAULT_CATEGORIES[i];

      const parent = await tx.category.create({
        data: {
          userId,
          name: top.name,
          type: top.type,
          icon: top.icon,
          color: top.color,
          isCustom: false,
          sortOrder: i,
        },
      });

      if (top.children?.length) {
        for (let j = 0; j < top.children.length; j++) {
          const child = top.children[j];
          await tx.category.create({
            data: {
              userId,
              name: child.name,
              type: top.type,
              parentId: parent.id,
              icon: child.icon,
              color: child.color,
              isCustom: false,
              sortOrder: j,
            },
          });
        }
      }
    }
  });

  return { seeded: true };
}