"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";
import { transformData } from "@/lib/utils";
import {
    ICommunityCosts,
    ICommunityModelCost,
    ICostChart
} from "@/types/community";
import dayjs from "dayjs";
import { fixDbTime } from "../action-utils";
import { revalidatePath } from "next/cache";
import { calculateCommunitModelCost } from "@/lib/community/community-utils";

export async function _importModelCostData(
    id,
    modelName,
    builderId,
    meta,
    builderTasks
) {
    const template = await prisma.homeTemplates.findFirst({
        where: {
            modelName,
            builderId
        },
        include: {
            costs: true
        }
    });
    if (template && template.costs.length) {
        console.log(template);
        await prisma.communityModelCost.deleteMany({
            where: {
                communityModelId: id
            }
        });
        const _comm = await prisma.communityModels.update({
            where: { id },
            data: {
                costs: {
                    createMany: {
                        data: template.costs.map(cost => ({
                            model: cost.model,
                            title: cost.title,
                            type: cost.type,
                            meta: calculateCommunitModelCost(
                                cost.meta,
                                builderTasks
                            ) as any,
                            createdAt: cost.createdAt,
                            updatedAt: cost.updatedAt,
                            current: cost.current,
                            endDate: cost.endDate,
                            startDate: cost.startDate
                        }))
                    }
                }
            },
            include: {
                costs: true
            }
        });
        revalidatePath("/settings/community/community-templates", "page");
        return _comm;
        // const _costs = await prisma.communityModelCost.createMany({
        //     data: template.costs.map(cost => ({
        //         model: cost.model,
        //         title: cost.title,
        //         type: cost.type,
        //         meta: cost.meta as any,
        //         createdAt: cost.createdAt,
        //         updatedAt: cost.updatedAt,
        //         current: cost.current,
        //         communityModelId: id,
        //         endDate: cost.endDate,
        //         startDate: cost.startDate
        //     }))
        // });
        // return template;
    }
    return null;
}

export async function _saveCommunitModelCostData(
    cost: ICommunityCosts,
    templateId
) {
    const { id: _id, communityModelId, ..._cost } = cost;
    let _c: ICostChart & {
        community: ICommunityModelCost;
    } = null as any;
    const title = [
        cost?.startDate ? formatDate(cost?.startDate, "MM/DD/YY") : null,
        cost?.endDate ? formatDate(cost?.endDate, "MM/DD/YY") : "To Date"
    ].join(" - ");
    _cost.title = title;
    _cost.current = cost.endDate
        ? dayjs(cost.endDate).diff(dayjs(), "days") > 0
        : true;
    // _cost.model =
    if (!_id) {
        _c = (await prisma.communityModelCost.create({
            data: transformData({
                ..._cost,
                type: "task-costs",
                template: {
                    connect: {
                        id: templateId
                    }
                }
            }) as any,
            include: {
                community: true
            }
        })) as any;
    } else {
        _c = (await prisma.communityModelCost.update({
            where: {
                id: _id
            },
            data: {
                ...(_cost as any)
            },
            include: {
                community: true
            }
        })) as any;
    }
    await Promise.all(
        Object.entries(_c.meta.sumCosts).map(async ([k, v]) => {
            // const createdAt = {
            //     gte:  fixDbTime(dayjs(_c.startDate)).toISOString()
            // }
            // if(_c.endDate)
            //     createdAt.lte  = fixDbTime(dayjs(_c.endDate), 23, 59, 59).toISOString(),
            const { startDate: from, endDate: to } = _c;
            const s = await prisma.homeTasks.updateMany({
                where: {
                    home: {
                        communityTemplateId: templateId,
                        createdAt: {
                            gte: !from
                                ? undefined
                                : fixDbTime(dayjs(from)).toISOString(),
                            lte: !to
                                ? undefined
                                : fixDbTime(dayjs(to), 23, 59, 59).toISOString()
                        }
                    },
                    taskUid: k
                },
                data: {
                    amountDue: Number(v) || 0,
                    updatedAt: new Date()
                }
            });
            // console.log(s.count);
        })
    );
    revalidatePath("/settings/community/community-templates", "page");
    return _c;
}
export async function _synchronizeModelCost(_c, templateId) {
    await Promise.all(
        Object.entries(_c.meta.sumCosts).map(async ([k, v]) => {
            // const createdAt = {
            //     gte:  fixDbTime(dayjs(_c.startDate)).toISOString()
            // }
            // if(_c.endDate)
            //     createdAt.lte  = fixDbTime(dayjs(_c.endDate), 23, 59, 59).toISOString(),
            const { startDate: from, endDate: to } = _c;
            const s = await prisma.homeTasks.updateMany({
                where: {
                    home: {
                        communityTemplateId: templateId,
                        createdAt: {
                            gte: !from
                                ? undefined
                                : fixDbTime(dayjs(from)).toISOString(),
                            lte: !to
                                ? undefined
                                : fixDbTime(dayjs(to), 23, 59, 59).toISOString()
                        }
                    },
                    taskUid: k
                },
                data: {
                    amountDue: Number(v) || 0,
                    updatedAt: new Date()
                }
            });
            // console.log(s.count);
        })
    );
}
