"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { getPageInfo, queryFilter } from "../action-utils";
import { Prisma } from "@prisma/client";

export interface JobPaymentQueryParamsProps extends BaseQuery {}
export async function getJobPayments(query: JobPaymentQueryParamsProps) {
  const where = whereJobPayment(query);
  const items = await prisma.jobPayments.findMany({
    where,
    include: {
      user: true,
      payer: {
        include: {
          roles: true,
        },
      },
      //   jobs: true,
      _count: {
        select: {
          jobs: true,
        },
      },
    },
    ...(await queryFilter(query)),
  });

  const pageInfo = await getPageInfo(query, where, prisma.jobPayments);

  return {
    pageInfo,
    data: items as any,
  };
}
function whereJobPayment(query: JobPaymentQueryParamsProps) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.JobPaymentsWhereInput = {};
  return where;
}
