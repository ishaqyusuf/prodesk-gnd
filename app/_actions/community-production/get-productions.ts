"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface ProductionsQueryParams extends BaseQuery {
    _projectId?;
}
export async function getProductions(query: ProductionsQueryParams) {
    const where = whereProductionQuery(query);
    const _items = await prisma.homeTasks.findMany({
        ...(await queryFilter(query)),
        where,
        include: {
            home: true,
            project: true
        }
    });
    const pageInfo = await getPageInfo(query, where, prisma.homeTasks);
    return {
        pageInfo,
        data: _items as any
    };
}
function whereProductionQuery(query: ProductionsQueryParams) {
    const q = {
        contains: query._q || undefined
    };
    const where: Prisma.HomeTasksWhereInput = {
        produceable: true,
        OR: query?._q
            ? [
                  {
                      home: {
                          OR: [
                              { modelName: q },
                              {
                                  search: q
                              }
                          ]
                      }
                  }
              ]
            : undefined
    };
    if (query._projectId) where.projectId = +query._projectId;
    return where;
}
