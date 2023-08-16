"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { dateQuery, getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface HomeQueryParams extends BaseQuery {
  _builderId;
  _projectSlug;
}
export async function getProjectHomesAction(query: HomeQueryParams) {
  const where = whereHome(query, true);
  const project = await prisma.projects.findUnique({
    where: {
      slug: query._projectSlug,
    },
    include: {
      builder: true,
      homes: {
        ...(await queryFilter(query)),
        where,
        include: {
          tasks: {
            select: {
              taskUid: true,
              produceable: true,
              producedAt: true,
              sentToProductionAt: true,
              installedAt: true,
            },
          },
        },
      },
    },
  });
  if (!project) throw new Error("Project Not found");
  const pageInfo = await getPageInfo(query, whereHome(query), prisma.homes);
  const { homes, ...pdata } = project;
  return {
    pageInfo,
    data: homes,
    project: pdata,
  };
}
function whereHome(query: HomeQueryParams, include = false) {
  const q = {
    contains: query._q || undefined,
  };

  const where: Prisma.HomesWhereInput = {
    builderId: {
      equals: Number(query._builderId) || undefined,
    },
    search: q,
    ...dateQuery(query),
  };
  if (!include && query._projectSlug) {
    where.project = {
      slug: query._projectSlug,
    };
  }
  return where;
}
