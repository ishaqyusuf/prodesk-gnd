"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";
import { whereQuery } from "@/lib/db-utils";

export interface ProductionsQueryParams extends BaseQuery {
    _projectId?;
}
export async function getProductions(query: ProductionsQueryParams) {
    const where = whereProductionQuery(query);
    const _items = await prisma.homeTasks.findMany({
        ...(await queryFilter(query)),
        where,
        include: {
            home: {
                include: {
                    _count: {
                        select: {
                            jobs: true
                        }
                    }
                }
            },
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
    console.log(query);
    const q = {
        contains: query._q || undefined
    };
    const builder = whereQuery<Prisma.HomeTasksWhereInput>(query);
    builder.raw({
        produceable: true
    });
    builder.search({
        home: {
            OR: [{ modelName: builder.q }, { search: builder.q }]
        }
    });
    builder.orWhere("projectId", +query._projectId);
    return builder.get();
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
