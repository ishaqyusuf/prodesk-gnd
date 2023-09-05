"use server";

import { prisma } from "@/db";
import { HomeTemplateMeta } from "@/types/community";

export async function updateModelInstallCost(id, meta: HomeTemplateMeta) {
  await prisma.homeTemplates.update({
    where: { id },
    data: {
      meta: meta as any,
      updatedAt: new Date(),
    },
  });
}
