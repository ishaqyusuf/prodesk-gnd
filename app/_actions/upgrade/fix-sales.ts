"use server";

import { prisma } from "@/db";
import { IProjectMeta } from "@/types/community";
import { ISalesOrderItemMeta, ISalesOrderMeta } from "@/types/sales";

export async function salesSuppliers() {
  const salsItems = await prisma.salesOrderItems.findMany({
    where: {
      supplier: null,
    },
  });

  const inserts: any = {};
  salsItems.map((i) => {
    const m: ISalesOrderItemMeta = i.meta as any;
    const supplier = m?.supplier
      ?.replace('"')
      ?.trim()
      ?.toUpperCase();
    if (supplier) {
      inserts[supplier] = [...(inserts?.[supplier] || []), i.id];
    }
  });
  return Object.entries(inserts)
    .map<any>(
      ([k, v]) =>
        `UPDATE SalesOrderItems SET supplier="${k}" WHERE id in (${(v as any).join(
          ","
        )});`
    )
    .join("\n");
}

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
