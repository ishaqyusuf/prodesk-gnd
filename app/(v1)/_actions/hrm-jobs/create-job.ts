"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { userId } from "../utils";
import { _notifyAdminJobSubmitted } from "../notifications";
import { Jobs, Prisma } from "@prisma/client";
import { IJobType, IJobs } from "@/types/hrm";

export async function createJobAction(data: IJobs) {
    data.status = "Submitted";
    data.statusDate = new Date();
    if (!data.userId) data.userId = await userId();
    // let amount = data.amount;
    // if (data.coWorkerId) amount /= 2;

    const job = await prisma.jobs.create({
        data: {
            ...data,
            ...(transformData({ meta: data.meta }) as any)
            // amount
        },
        include: {
            user: true,
            coWorker: true
        }
    });
    _notifyAdminJobSubmitted(job as any);
    if (job.coWorkerId) {
        const job2 = await prisma.jobs.create({
            data: {
                ...data,
                ...(transformData({ meta: data.meta }) as any),
                // amount,
                userId: data.coWorkerId,
                coWorkerId: data.userId
            },
            include: {
                user: true,
                coWorker: true
            }
        });
        _notifyAdminJobSubmitted(job2 as any);
    }
    const type: IJobType = data.type as any;
    if (data.homeId) {
        const where: Prisma.HomeTasksWhereInput = {
            homeId: data.homeId
        };
        if (type == "installation") where.installable = true;
        if (type == "Deco-Shutter") where.deco = true;
        if (type == "punchout") where.punchout = true;
        await prisma.homeTasks.updateMany({
            where,
            data: {
                status: "Completed",
                statusDate: new Date()
            }
        });
    }
}
export async function updateJobAction({ id, ...jdata }: IJobs) {
    // let amount = jdata.amount;
    // if (jdata.coWorkerId) amount /= 2;
    // const status = jdata.status;
    // if()
    if (jdata.status?.toLowerCase() == "assigned") {
        jdata.status = "Submitted";
    }
    const job = await prisma.jobs.update({
        where: { id },
        data: {
            ...jdata,
            ...transformData({}, true)
            // amount
        } as any
    });
    if (job.coWorkerId) {
        const job2 = await prisma.jobs.findFirst({
            where: {
                coWorkerId: job.userId,
                userId: job.coWorkerId,
                title: job.title
            }
        });
        if (job2) {
            await prisma.jobs.update({
                where: {
                    id: job2.id
                },
                data: {
                    ...jdata,
                    ...(transformData({ meta: jdata.meta }, true) as any),
                    // amount,
                    userId: jdata.coWorkerId,
                    coWorkerId: jdata.userId
                },
                include: {
                    user: true,
                    coWorker: true
                }
            });
        } else {
            const job2 = await prisma.jobs.create({
                data: {
                    ...jdata,
                    ...(transformData({ meta: jdata.meta }) as any),
                    // amount,
                    userId: jdata.coWorkerId,
                    coWorkerId: jdata.userId
                },
                include: {
                    user: true,
                    coWorker: true
                }
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