"use server";

import { prisma } from "@/db";

export async function staticBuildersAction() {
  const _data = await prisma.builders.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  return _data;
}
