"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface JobsQueryParamsProps extends Omit<BaseQuery, "_show"> {
  _show?: "unpaid" | "paid" | "approved" | "submitted";
}
export async function getJobs(query: JobsQueryParamsProps) {
  const where = whereJobs(query);
  const items = await prisma.jobs.findMany({
    where,
    include: {
      user: true,

      // jobs: true,
    },
    ...(await queryFilter(query)),
  });

  const pageInfo = await getPageInfo(query, where, prisma.jobs);

  return {
    pageInfo,
    data: items as any,
  };
}
function whereJobs(query: JobsQueryParamsProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.JobsWhereInput = {
    description: q,
    subtitle: q,
    title: q,
    projectId: Number(query._projectId) || undefined,
  };

  if (query._show == "unpaid") where.paymentId = null;
  else if (query._show == "paid")
    where.paymentId = {
      gt: 0,
    };
  else
    where.status = {
      contains: query._show || undefined,
    };

  if (query._userId) where.userId = +query._userId;

  return where;
}
