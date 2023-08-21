"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { dateQuery, getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface HomeQueryParams extends BaseQuery {
  _builderId;
  _projectSlug;
}
export async function getHomesAction(query: HomeQueryParams) {
  const where = whereHome(query);
  const homes = await prisma.homes.findMany({
    ...(await queryFilter(query)),
    include: {
      project: {
        include: {
          builder: true,
        },
      },
      tasks: {
        select: {
          taskUid: true,
          produceable: true,
          producedAt: true,
          installable: true,
          sentToProductionAt: true,
          installedAt: true,
        },
      },
    },
  });
  const pageInfo = await getPageInfo(query, where, prisma.homes);
  return {
    pageInfo,
    data: homes,
  };
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
          jobs: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          tasks: {
            select: {
              taskUid: true,
              produceable: true,
              installable: true,
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
    data: homes.map((home) => {
      return {
        ...home,
        project: pdata,
      };
    }),
    project: pdata,
  };
}
export async function deleteHome(id) {
  //delete home along with accessories
  await prisma.homes.delete({
    where: {
      id,
    },
    include: {
      jobs: true,
      tasks: true,
    },
  });
}
function whereHome(query: HomeQueryParams, asInclude = false) {
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
  if (!asInclude && query._projectSlug) {
    where.project = {
      slug: query._projectSlug,
    };
  }
  return where;
}
