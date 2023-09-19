"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { dateQuery, getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface HomeQueryParams extends BaseQuery {
  _builderId;
  _projectSlug;
  _projectId?;
  _production?: "Started" | "Queued" | "Idle" | "Completed";
  _installation?: "Submitted" | "No Submission";
}
export async function getHomesAction(query: HomeQueryParams) {
  const where = await whereHome(query);
  const homes = await prisma.homes.findMany({
    ...(await queryFilter(query)),
    where,
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

          amountDue: true,
          amountPaid: true,
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
  const where = await whereHome(query, true);
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
            },
          },
        },
      },
    },
  });
  if (!project) throw new Error("Project Not found");
  const pageInfo = await getPageInfo(
    query,
    await whereHome(query),
    prisma.homes
  );
  const { homes, ...pdata } = project as any;
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
export async function whereHome(query: HomeQueryParams, asInclude = false) {
  const q: any = {
    contains: query._q || undefined,
  };
  // if (query._q) q.contains = query._q;

  const where: Prisma.HomesWhereInput = {
    builderId: {
      equals: Number(query._builderId) || undefined,
    },
    ...dateQuery(query),
  };
  if (q.contains)
    where.OR = [
      {
        search: q,
      },
      {
        modelName: q,
      },
    ];
  if (!asInclude) {
    if (query._projectSlug) {
      where.project = {
        slug: query._projectSlug,
      };
    }
  }
  if (query._projectId) where.projectId = Number(query._projectId);
  switch (query._production) {
    case "Completed":
      break;
    case "Idle":
      break;
    case "Queued":
      break;
    case "Started":
      break;
  }
  switch (query._installation) {
    case "No Submission":
      break;
    case "Submitted":
      break;
  }
  return where;
}
