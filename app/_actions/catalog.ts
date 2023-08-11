"use server";

import { prisma } from "@/db";
import { queryFilter } from "./action-utils";

interface Props {
  page?;
  per_page?;
  q?;
}
export async function loadCatalog(filter: Props) {
  if (!filter.per_page) filter.per_page = 20;
  const inputQ = { contains: filter.q || undefined };
  const prods = await prisma.inventoryProducts.findMany({
    include: {
      variants: true,
    },
    where: {
      OR: [
        { title: inputQ },
        {
          variants: {
            some: {
              variantTitle: inputQ,
            },
          },
        },
      ],
      variants: {
        some: {
          id: {
            gt: 0,
          },
          price: {
            gt: 0,
          },
        },
      },
    },
    ...((await queryFilter(filter)) as any),
  });
  return prods;
}
