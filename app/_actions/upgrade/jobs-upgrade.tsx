"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";

export async function upgradeJobPayments() {
  const groupings = {};
  // await prisma.jobPayments.deleteMany({});
  // await prisma.tasks.updateMany({
  //   where: {},
  //   data: {
  //     paymentId: null,
  //   },
  // });
  const set = new Set<number>();
  (
    await prisma.tasks.findMany({
      select: {
        paymentId: true,
      },
    })
  ).map((i) => i.paymentId && set.add(i.paymentId)); // as number[];
  const pids = Array.from(set);
  // return pids;
  const __ = await prisma.jobPayments.findMany({
    where: {
      id: {
        notIn: pids,
      },
    },
    select: {
      id: true,
    },
  });
  await prisma.jobPayments.deleteMany({
    where: {
      id: {
        in: __.map((g) => g.id),
      },
    },
  });
  return [__.length, pids];
  const jobs = await prisma.tasks.findMany({
    where: {},
    include: {
      // payment: true,
    },
  });
  jobs.map((j) => {
    // if(j.payment)
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
  const c = [Object.values(groupings).length];
  // return c;
  await Promise.all(
    Object.values(groupings)
      .filter((_, i) => i < 50)
      .map(async (v) => {
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
  return c;
}
