"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
import { IBuilder } from "@/types/community";
import { revalidatePath } from "next/cache";
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
export async function saveBuilderTasks(data: IBuilder) {
    await prisma.builders.update({
        where: {
            id: data.id
        },
        data: {
            meta: data.meta as any
        }
    });
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
                    produceable: p.produceable
                }
            });
        })
    );
    revalidatePath("/settings/community/builders", "page");
}
export async function saveBuilderInstallations(data: IBuilder) {}
