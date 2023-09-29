"use server";

import { prisma } from "@/db";
import { removeEmptyValues, transformData } from "@/lib/utils";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
import { whereQuery } from "@/lib/db-utils";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

export interface HomeTemplatesQueryParams extends BaseQuery {}
export async function getHomeTemplates(query: HomeTemplatesQueryParams) {
    const where = whereHomeTemplate(query);
    const _items = await prisma.homeTemplates.findMany({
        where,
        include: {
            builder: true,
            costs: {
                orderBy: {
                    endDate: "desc"
                }
            }
            // _count: {
            //   // homes: true,
            // },
        },

        ...(await queryFilter(query))
    });
    const pageInfo = await getPageInfo(query, where, prisma.homeTemplates);

    return {
        pageInfo,
        data: _items as any
    };
}
export async function getCommunityTemplates(query: HomeTemplatesQueryParams) {
    const where = whereCommunityTemplate(query);
    const _items = await prisma.communityModels.findMany({
        where,
        include: {
            project: {
                select: {
                    title: true,
                    builder: {
                        select: {
                            name: true
                        }
                    }
                }
            }
            // builder: true,
            // _count: {
            //   // homes: true,
            // },
        },
        ...(await queryFilter(query))
    });
    const pageInfo = await getPageInfo(query, where, prisma.communityModels);

    return {
        pageInfo,
        data: _items as any
    };
}
function whereCommunityTemplate(query: HomeTemplatesQueryParams) {
    const q = {
        contains: query._q || undefined
    };
    const where = whereQuery<Prisma.CommunityModelsWhereInput>(query);
    where.searchQuery("modelName");
    where.search({
        project: { title: where.q }
    });
    return where.get();
    // const where: Prisma.CommunityModelsWhereInput = {
    //   modelName: q,
    //   project: { title: q },
    // };

    return where;
}
function whereHomeTemplate(query: HomeTemplatesQueryParams) {
    const q = {
        contains: query._q || undefined
    };
    const where: Prisma.HomeTemplatesWhereInput = {
        modelName: q

        // builderId: {
        //   equals: Number(query._builderId) || undefined,
        // },
    };

    return where;
}
export async function printHomesAction(
    homes: { builderId: number; projectId: number; modelName }[]
) {
    const prints = await prisma.homeTemplates.findMany({
        where: {
            OR: homes.map(({ builderId, modelName }) => {
                const w: Prisma.HomeTemplatesWhereInput = {
                    builderId,
                    modelName
                };
                return w;
            })
        }
    });
    const communityPrints = await prisma.communityModels.findMany({
        where: {
            OR: homes.map(({ projectId, modelName }) => {
                const w: Prisma.CommunityModelsWhereInput = {
                    projectId,
                    modelName
                };
                return w;
            })
        }
    });
    return { prints, communityPrints };
}
export async function getHomeTemplate(slug) {
    const homeTemplate = await prisma.homeTemplates.findUnique({
        where: { slug }
    });
    if (!homeTemplate) throw new Error("Home template not found");
    return homeTemplate;
}
export async function getCommunityTemplate(slug) {
    const homeTemplate = await prisma.communityModels.findUnique({
        where: { slug }
    });
    if (!homeTemplate) throw new Error("Home template not found");
    return homeTemplate;
}
export async function saveHomeTemplateDesign(slug, meta) {
    await prisma.homeTemplates.update({
        where: { slug },
        data: {
            ...transformData({}, true),
            meta: removeEmptyValues(meta) as any
        }
    });
}
export async function saveCommunityTemplateDesign(slug, meta) {
    await prisma.communityModels.update({
        where: {
            slug
        },
        data: {
            ...transformData({}, true),
            meta: meta as any
        }
    });
}
export async function deleteHomeTemplateAction(id) {}
export async function _createCommunityTemplate(data, projectName) {
    const slug = slugify(`${projectName} ${data.modelName}`);

    await prisma.communityModels.create({
        data: {
            slug,
            ...data,
            ...transformData({})
        }
    });
    revalidatePath("/settings/community/community-templates", "page");
}
export async function _createModelTemplate(data, builderName) {
    const slug = slugify(`${builderName} ${data.modelName}`);

    await prisma.homeTemplates.create({
        data: {
            // slug: slugify(data.modelName)
            ...data,
            ...transformData({})
        }
    });
    revalidatePath("/settings/community/model-templates", "page");
}
