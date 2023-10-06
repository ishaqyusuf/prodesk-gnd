"use server";

import { prisma } from "@/db";
import { BaseQuery, TableApiResponse } from "@/types/action";
import { IProject, IProjectMeta } from "@/types/community";
import { Prisma, Projects } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
import { slugModel, transformData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface ProjectsQueryParams extends BaseQuery {
    _builderId;
}

export async function getProjectsAction(
    query: ProjectsQueryParams
): TableApiResponse<IProject> {
    const where = whereProject(query);
    const _items = await prisma.projects.findMany({
        where,
        include: {
            _count: {
                select: {
                    homes: true
                }
            },
            builder: true
        },
        ...(await queryFilter(query))
    });
    const pageInfo = await getPageInfo(query, where, prisma.projects);

    return {
        pageInfo,
        data: _items as any
    };
}

export async function saveProject(project: Projects) {
    project.slug = await slugModel(project.title, prisma.projects);
    await prisma.projects.create({
        data: transformData(project) as any
    });
}
function whereProject(query: ProjectsQueryParams) {
    const q = {
        contains: query._q || undefined
    };
    const where: Prisma.ProjectsWhereInput = {
        builderId: {
            equals: Number(query._builderId) || undefined
        },
        title: q
    };

    return where;
}
export async function staticProjectsAction() {
    const _data = await prisma.projects.findMany({
        select: {
            id: true,
            title: true,
            builderId: true
        },
        orderBy: {
            title: "asc"
        }
    });
    return _data;
}
export async function updateCommunityCost(id, meta: IProjectMeta) {
    await updateProjectMeta(id, meta);
    revalidatePath("/settings/community/community-costs", "page");
}
export async function updateProjectMeta(id, meta: IProjectMeta) {
    await prisma.projects.update({
        where: {
            id
        },
        data: {
            meta: meta as any,
            updatedAt: new Date()
        }
    });
    // revalidatePath('')
}
