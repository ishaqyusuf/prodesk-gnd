"use server";

import { calculateCommunitModelCost } from "@/components/modals/model-cost-community-modal";
import { prisma } from "@/db";
import { ICommunityTemplateMeta, ICostChart } from "@/types/community";
import { revalidatePath } from "next/cache";

export async function updateCommunityModelInstallCost(id, meta) {
    await prisma.communityModels.update({
        where: { id },
        data: {
            meta,
            updatedAt: new Date()
        }
    });
    revalidatePath("/settings/community/community-templates", "page");
}
export async function _saveCommunityModelCost(
    id,
    meta: ICommunityTemplateMeta
) {
    const community = await prisma.communityModels.update({
        where: { id },
        data: {
            meta: meta as any,
            updatedAt: new Date()
        },
        include: {
            _count: {
                select: {
                    homes: true
                }
            }
        }
    });
    // community.
    if (!community._count.homes)
        await prisma.homes.updateMany({
            where: {
                projectId: community.projectId,
                modelName: community.modelName
            },
            data: {
                communityTemplateId: community.id
            }
        });
    await Promise.all(
        Object.entries(meta.modelCost.sumCosts).map(async ([k, v]) => {
            await prisma.homeTasks.updateMany({
                where: {
                    taskUid: k,
                    home: {
                        projectId: community.projectId,
                        modelName: community.modelName
                    }
                },
                data: {
                    // taxCost:
                    amountDue: Number(v) || 0
                }
            });
        })
    );
    revalidatePath("/settings/community/community-templates", "page");
}
export async function _importModelCost(
    id,
    modelName,
    builderId,
    meta,
    builderTasks
) {
    const q = modelName
        .toLowerCase()
        .split(" ")
        .filter(v => !["lh", "rl"].some(sp => v != sp))
        .filter(Boolean)
        .join(" ");

    const cost: ICostChart = (await prisma.costCharts.findFirst({
        where: {
            template: {
                builderId
                // modelName: {
                //     contains: q
                // }
            },
            model: q
        },
        // include: {
        //     template: {
        //         include: {
        //             builder: true
        //         }
        //     }
        // },
        orderBy: {
            updatedAt: "desc"
        }
    })) as any;
    if (cost) {
        await _saveCommunityModelCost(id, {
            ...(meta ?? {}),
            modelCost: calculateCommunitModelCost(cost.meta, builderTasks)
        });
        return true;
    }
    return false;
}
