"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { userId } from "../utils";
import { _notifyAdminJobSubmitted } from "../notifications";
import { Jobs } from "@prisma/client";

export async function createJobAction(data: Jobs) {
  data.status = "Submited";
  data.statusDate = new Date();
  if (!data.userId) data.userId = await userId();
  let amount = data.amount;
  if (data.coWorkerId) amount /= 2;

  const job = await prisma.jobs.create({
    data: {
      ...data,
      ...(transformData({ meta: data.meta }) as any),
      amount,
    },
    include: {
      user: true,
      coWorker: true,
    },
  });
  _notifyAdminJobSubmitted(job as any);
  if (job.coWorkerId) {
    const job2 = await prisma.jobs.create({
      data: {
        ...data,
        ...(transformData({ meta: data.meta }) as any),
        amount,
        userId: data.coWorkerId,
        coWorkerId: data.userId,
      },
      include: {
        user: true,
        coWorker: true,
      },
    });
    _notifyAdminJobSubmitted(job2 as any);
  }
}
export async function updateJobAction({ id, ...jdata }: Jobs) {
  let amount = jdata.amount;
  if (jdata.coWorkerId) amount /= 2;
  const job = await prisma.jobs.update({
    where: { id },
    data: {
      ...jdata,
      ...transformData({}, true),
      amount,
    } as any,
  });
  if (job.coWorkerId) {
    const job2 = await prisma.jobs.findFirst({
      where: {
        coWorkerId: job.userId,
        userId: job.coWorkerId,
        title: job.title,
      },
    });
    if (job2) {
      await prisma.jobs.update({
        where: {
          id: job2.id,
        },
        data: {
          ...jdata,
          ...(transformData({ meta: jdata.meta }, true) as any),
          amount,
          userId: jdata.coWorkerId,
          coWorkerId: jdata.userId,
        },
        include: {
          user: true,
          coWorker: true,
        },
      });
    } else {
      const job2 = await prisma.jobs.create({
        data: {
          ...jdata,
          ...(transformData({ meta: jdata.meta }) as any),
          amount,
          userId: jdata.coWorkerId,
          coWorkerId: jdata.userId,
        },
        include: {
          user: true,
          coWorker: true,
        },
      });
    }
    //  const job2 = await prisma.jobs.create({
    //    data: {
    //      ...data,
    //      ...(transformData({ meta: data.meta }) as any),
    //      amount,
    //      userId: data.coWorkerId,
    //      coWorkerId: data.userId,
    //    },
    //    include: {
    //      user: true,
    //      coWorker: true,
    //    },
    //  });
    //  _notifyAdminJobSubmitted(job2 as any);
  }
}
