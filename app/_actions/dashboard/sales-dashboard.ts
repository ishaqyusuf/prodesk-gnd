"use server";

import { prisma } from "@/db";
import { composeBar } from "@/lib/chart";
import { sum } from "@/lib/utils";
import { ISalesDashboard } from "@/types/dashboard";

interface Props {}
export async function salesDashboardAction(): Promise<ISalesDashboard> {
  const salesByMonthAndYear: any[] = await prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM createdAt) as year,
      EXTRACT(MONTH FROM createdAt) as month,
     SUM(amount) as value
    -- ROUND(SUM(amount)::numeric, 2) as value
    FROM
      SalesPayments
    GROUP BY
      year,
      month
    ORDER BY
      year, month;`;
  let bar = composeBar(salesByMonthAndYear);

  const sales = await prisma.salesOrders.findMany({
    select: {
      amountDue: true,
      prodQty: true,
      builtQty: true,
      prodStatus: true,
    },
  });
  const payments = await prisma.salesPayments.findMany({
    select: {
      amount: true,
    },
  });
  const response: ISalesDashboard = {
    bar,
  } as any;
  response.totalSales = sum(payments, "amount");
  response.amountDue = sum(sales, "amountDue");
  let pd = (response.pendingDoors = sum(sales, "builtQty"));
  let td = (response.totalDoors = sum(sales, "prodQty"));
  response.completedDoors = td - pd;
  let pendingCompletion = sales?.filter((s) => s.prodStatus != "Completed")
    .length;
  response.pendingOrders = pendingCompletion;
  response.totalOrders = await prisma.salesOrders.count({});
  response.completedOrders = sales?.filter(
    (s) => s.prodStatus == "Completed"
  ).length;
  const recentSales = await prisma.salesOrders.findMany({
    take: 5,
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      customer: true,
    },
    // where: {}
  });
  response.recentSales = recentSales as any;

  return response;
}
