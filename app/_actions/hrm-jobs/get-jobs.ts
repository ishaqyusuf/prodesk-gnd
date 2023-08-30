"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface JobsQueryParamsProps extends BaseQuery {
  show?: "unpaid" | "paid";
  userId?;
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
  const where: prisma.jobsWhereInput = {};
  if (query.show == "unpaid") where.paymentId = undefined;
  if (query.show == "paid")
    where.paymentId = {
      gt: 0,
    };
  if (query.userId) query.userId = +query.userId;

  console.log("QUERY++>", query);
  return where;
}
