"use server";

import { prisma } from "@/db";
import { BaseQuery } from "@/types/action";
import { Prisma } from "@prisma/client";
import { getPageInfo } from "../action-utils";
export interface InvoiceQueryParams extends BaseQuery {}
export async function getInvoices(query: InvoiceQueryParams) {
  const where = whereInvoice(query);
  const _items = await prisma.invoices.findMany({
    where: {},
    include: {
      home: {
        select: {
          tasks: {
            // select: {}
          },
        },
      },
      project: {
        select: {
          builder: true,
        },
      },
    },
  });
  const pageInfo = await getPageInfo(query, where, prisma.invoices);

  return {
    pageInfo,
    data: _items as any,
  };
}
function whereInvoice(query: InvoiceQueryParams) {
  const q = {
    contains: query._q || undefined,
  };
  const where: Prisma.InboxWhereInput = {
    // builderId: {
    //   equals: Number(query._builderId) || undefined,
    // },
  };

  return where;
}
