"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
import { IBuilder, IBuilderTasks, IHomeTask } from "@/types/community";
import { revalidatePath } from "next/cache";
import { transformData } from "@/lib/utils";
export interface BuildersQueryParams extends BaseQuery {}
export async function getBuildersAction(query: BuildersQueryParams) {
    const where = whereBuilder(query);
    const _items = await prisma.builders.findMany({
        where,
        include: {
            _count: {
                select: {
                    projects: true
                }
            }
            //  builder: true,
        },
        ...(await queryFilter(query))
    });
    const pageInfo = await getPageInfo(query, where, prisma.builders);

    return {
        pageInfo,
        data: _items as any
    };
}
function whereBuilder(query: BuildersQueryParams) {
    const q = {
        contains: query._q || undefined
    };
    const where: Prisma.BuildersWhereInput = {
        // builderId: {
        //   equals: Number(query._builderId) || undefined,
        // },
    };

    return where;
}
export async function staticBuildersAction() {
    const _data = await prisma.builders.findMany({
        select: {
            id: true,
            name: true
        }
    });
    return _data;
}
export async function deleteBuilderAction(id) {}
export async function saveBuilder(data: IBuilder) {
    // data.createdAt = data.
}
export async function saveBuilderTasks(data: IBuilder, deleteIds, newTaskIds) {
    await prisma.builders.update({
        where: {
            id: data.id
        },
        data: {
            meta: data.meta as any
        }
    });

    const taskNames: any = [];
    await Promise.all(
        data.meta.tasks.map(async p => {
            await prisma.homeTasks.updateMany({
                where: {
                    home: {
                        builderId: data.id
                    },
                    taskUid: p.uid
                    // taskName: {
                    //     not: p.name
                    // }
                },
                data: {
                    taskName: p.name,
                    billable: p.billable,
                    produceable: p.produceable,
                    installable: p.installable,
                    deco: p.deco,
                    punchout: p.punchout
                }
            });
        })
    );
    if (deleteIds?.length)
        await prisma.homeTasks.deleteMany({
            where: {
                taskUid: {
                    in: deleteIds
                },
                home: {
                    installedAt: null
                }
                // prodStartedAt: null,
            }
        });

    if (newTaskIds) {
        // let tasks
        let homes = await prisma.homes.findMany({
            where: {
                builderId: data.id
            },
            select: {
                id: true,
                projectId: true,
                search: true,
                jobs: {
                    select: {
                        id: true
                    }
                }
            }
        });
        const taskData = homes
            .map(h =>
                // !h.jobs.length &&
                ({
                    projectId: h.projectId,
                    homeId: h.id,
                    search: h.search
                })
            )
            .filter(Boolean);
        await createBuilderTasks(
            data.meta.tasks.filter(t => newTaskIds.includes(t.uid)),
            taskData as any
        );
    }
    const homes = await prisma.homes.findMany({
        where: {
            builderId: data.id
        },
        select: {
            id: true,
            projectId: true,
            search: true,
            tasks: {
                select: {
                    id: true,
                    taskUid: true
                }
            }
        }
    });
    console.log(homes.length);
    let tasks: any[] = [];
    homes.map(home => {
        let bTasks = data.meta.tasks.filter(
            t => !home.tasks.some(s => s.taskUid == t.uid)
        );
        if (bTasks.length) {
            tasks.push(
                ...createBuilderTasks(bTasks, [
                    {
                        projectId: home.projectId,
                        homeId: home.id,
                        search: home.search
                    }
                ])
            );
        }
    });
    console.log(tasks.length);
    await prisma.homeTasks.createMany({
        data: tasks
    });
    revalidatePath("/settings/community/builders", "page");
}
export async function deleteBuilderTasks({ builderId, taskIds }) {}
export async function addBuilderTasks({ builderId, tasksIds, tasks }) {}
export async function saveBuilderInstallations(data: IBuilder) {}
function createBuilderTasks(
    builderTasks: IBuilderTasks[],
    taskData: {
        projectId;
        homeId;
        search;
    }[],
    homeCost?
) {
    const tasks: any[] = [];
    taskData.map(td => {
        builderTasks.map(builderTask => {
            const _task: IHomeTask = {
                meta: {},
                ...td
            } as any;
            _task.billable = builderTask.billable as boolean;
            _task.installable = builderTask.installable as boolean;
            const uid = (_task.taskUid = builderTask.uid);
            _task.taskName = builderTask.name;
            _task.amountDue = _task.meta.system_task_cost =
                Number(homeCost?.meta?.costs[uid]) || (null as any);
            _task.status = "";
            tasks.push(transformData(_task));
        });
    });
    return tasks;
}
