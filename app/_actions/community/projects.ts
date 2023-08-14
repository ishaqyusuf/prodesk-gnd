"use server";

import { prisma } from "@/db";
import { BaseQuery, TableApiResponse } from "@/types/action";
import { IProject } from "@/types/community";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";

export interface ProjectsQueryParams extends BaseQuery {}

export async function getProjectsAction(
  query: ProjectsQueryParams
): TableApiResponse<IProject> {
  const where = whereProject(query);
  const _items = await prisma.projects.findMany({
    where,
    include: {
      _count: {
        select: {
          homes: true,
        },
      },
    },
    ...(await queryFilter(query)),
  });
  const pageInfo = await getPageInfo(query, where, prisma.projects);
  return {
    pageInfo,
    data: _items as any,
  };
}
function whereProject(query: ProjectsQueryParams) {
  const where: Prisma.ProjectsWhereInput = {};
  return where;
}
