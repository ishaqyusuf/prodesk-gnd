"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { IBuilder, IHomeTask, IHomeTemplate } from "@/types/community";
import { Homes } from "@prisma/client";

export async function createHomesAction(homes: Homes[]) {
    const builders = await prisma.builders.findMany({
        where: {
            id: {
                in: homes.map(h => h.builderId).filter(Boolean) as number[]
            }
        }
    });
    // const homeTemplate: IHomeTemplate = (await prisma.homeTemplates.findFirst({
    //     where: {
    //         builderId: homes[0]?.builderId,
    //         modelName: homes[0]?.modelName
    //     },
    //     include: {
    //         costs: {
    //             where: {
    //                 current: true
    //             }
    //         }
    //     }
    // })) as any;
    // const homeCost = homeTemplate?.costs?.[0];
    const tasks: any[] = [];

    await Promise.all(
        homes.map(async homeData => {
            const lblck = [homeData.lot || "-", homeData.block || "-"].join(
                "/"
            );
            homeData.lotBlock = lblck;
            const home = await prisma.homes.create({
                data: transformData(homeData) as any
            });

            const builder: IBuilder = builders.find(
                b => b.id == home.builderId
            ) as any;
            builder.meta.tasks.map(builderTask => {
                const _task: IHomeTask = {
                    meta: {},
                    createdAt: new Date(),
                    updatedAt: new Date()
                } as any;
                _task.projectId = home.projectId;
                _task.homeId = home.id;

                _task.search = home.search;
                _task.billable = builderTask.billable as boolean;
                _task.installable = builderTask.installable as boolean;
                const uid = (_task.taskUid = builderTask.uid);
                _task.taskName = builderTask.name;
                // _task.amountDue = _task.meta.system_task_cost =
                //     Number(homeCost?.meta?.costs[uid]) || (null as any);

                // homeTemplate.meta
                //   .task_costs[uid] as any;
                _task.status = "";
                tasks.push(transformData(_task));
            });
            await prisma.homeTasks.createMany({
                data: tasks
            });
        })
    );
}
