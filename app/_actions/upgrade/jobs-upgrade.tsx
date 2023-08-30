"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";

export async function exportPrisma() {
  await prisma.jobs.create({
    data: {
      amount: 100,
      status: "Paid",
      type: "installation",
      adminNote: "Note",
      createdAt: new Date(),
      updatedAt: new Date(),
      description: "Non",
      meta: {},
      subtitle: "None",
    },
  });
  const tasks = await prisma.jobs.count({});
  return [tasks];
  const payments = await prisma.jobPayments.findMany({});

  return {
    tasks,
    payments,
  };
}
export async function resetJobUpgrade() {
  await prisma.jobPayments.deleteMany({});
  await prisma.jobs.updateMany({
    where: {},
    data: {
      paymentId: null,
    },
  });
}
export async function removeRedundantPayments() {
  const set = new Set<number>();
  (
    await prisma.jobs.findMany({
      select: {
        paymentId: true,
      },
    })
  ).map((i) => i.paymentId && set.add(i.paymentId)); // as number[];
  const pids = Array.from(set);

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
}
export async function upgradeJobPayments() {
  // return await exportPrisma
  const groupings = {};

  const jobs = await prisma.jobs.findMany({
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
      .filter((_, i) => i < 20)
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
        await prisma.jobs.updateMany({
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
