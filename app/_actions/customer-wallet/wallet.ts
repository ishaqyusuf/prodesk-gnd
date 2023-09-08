"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";

export async function getCustomerWallet(customerId) {
  const w = await prisma.customerWallet.findFirst({
    where: {
      customer: {
        id: customerId,
      },
    },
  });
  if (w) return w;
  const wallet = await prisma.customerWallet.create({
    data: {
      ...transformData({}),
      balance: 0,
      meta: {},
      customer: {
        connect: {
          id: customerId,
        },
      },
    },
  });
  await prisma.customers.update({
    where: { id: customerId },
    data: {
      wallet: {
        connect: {
          id: wallet.id,
        },
      },
    },
  });
  return wallet;
}
