"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";

export async function upgradeJobPayments() {
  const groupings = {};
  const jobs = await prisma.tasks.findMany({
    where: {},
  });
  jobs.map((j) => {
    if (!j.paymentId && j.paidAt) {
      const date = formatDate(j.paidAt, "YYYY-MM-DD HH:mm");
      const node = `${j.userId} ${date}`;
      if (!groupings[node])
        groupings[node] = {
          jobIds: [],
          amount: 0,
          checkNo: j.checkNo,
          paidAt: j.paidAt,
          paidBy: j.paidBy,
          userId: j.userId,
        };
      groupings[node].jobIds.push(j.id);
      groupings[node].amount += j.amount; //.push(j.id);
    }
  });
  await Promise.all(
    Object.values(groupings).map(async (v) => {
      const { paidBy, checkNo, jobIds, paidAt, amount, userId } = v as any;
      const payment = await prisma.jobPayments.create({
        data: {
          paidBy,
          checkNo,
          userId,
          amount,
          createdAt: paidAt,
          meta: {},
          paymentMethod: "Check",
          updatedAt: paidAt,
        },
      });
      await prisma.tasks.updateMany({
        where: {
          id: {
            in: jobIds,
          },
        },
        data: {
          paymentId: payment.id,
        },
      });
    })
  );
  return groupings;
}
