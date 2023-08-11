"use server";

import { prisma } from "@/db";
import { dateQuery } from "../action-utils";
import dayjs from "dayjs";

export async function fixSales() {
  //
  const p = await prisma.salesOrders.findMany({
    where: {
      amountDue: 0,
    },
    include: {
      payments: true,
    },
  });
  console.log(p.length);
}
