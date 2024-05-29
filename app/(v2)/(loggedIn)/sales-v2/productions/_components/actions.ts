"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { DykeDoorType } from "../../type";
import { ISalesType } from "@/types/sales";
import { userId } from "@/app/(v1)/_actions/utils";
import { sum } from "@/lib/utils";
import salesData from "../../../sales/sales-data";

export async function _getProductionList({ query, production = false }) {
    const authId = await userId();
    const searchQuery = query?._q ? { contains: query?._q } : undefined;
    return prisma.$transaction(async (tx) => {
        const where: Prisma.SalesOrdersWhereInput = {
            // isDyke: true,
            type: "order" as ISalesType,

            OR: searchQuery
                ? [
                      {
                          orderId: searchQuery,
                      },
                      {
                          assignments: {
                              some: {
                                  assignedTo: {
                                      name: searchQuery,
                                  },
                              },
                          },
                      },
                      {
                          customer: {
                              OR: [
                                  {
                                      businessName: searchQuery,
                                  },
                                  {
                                      name: searchQuery,
                                  },
                              ],
                          },
                      },
                  ]
                : undefined,
            assignments: production
                ? {
                      some: {
                          assignedToId: authId,
                      },
                  }
                : undefined,

            items: {
                some: {
                    OR: [
                        {
                            salesDoors: {
                                some: {
                                    doorType: {
                                        in: salesData.productionDoorTypes,
                                    },
                                },
                            },
                        },
                        {
                            swing: {
                                not: null,
                            },
                        },
                        {
                            dykeProduction: true,
                        },
                    ],
                },
            },
        };
        const { pageCount, skip, take } = await paginatedAction(
            query,
            tx.salesOrders,
            where
        );
        const data = await tx.salesOrders.findMany({
            where,
            skip,
            take,
            include: {
                items: {
                    where: {
                        deletedAt: null,
                        swing: { not: null },
                    },
                },
                productionStatus: true,
                doors: {
                    where: {
                        deletedAt: null,
                        housePackageTool: {
                            doorType: {
                                in: salesData.productionDoorTypes,
                            },
                        },
                    },
                    select: {
                        id: true,
                        doorType: true,
                        lhQty: true,
                        rhQty: true,
                        totalQty: true,
                    },
                },
                assignments: {
                    where: {
                        deletedAt: null,
                        item: {
                            deletedAt: null,
                        },
                    },
                    include: {
                        assignedTo: {
                            select: {
                                name: true,
                                id: true,
                            },
                        },
                        salesDoor: {
                            select: {
                                id: true,
                                housePackageTool: {
                                    select: {
                                        door: {
                                            select: {
                                                id: true,
                                                title: true,
                                                img: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        submissions: {
                            where: {
                                deletedAt: null,
                            },
                            select: {
                                id: true,
                                qty: true,
                                rhQty: true,
                                lhQty: true,
                            },
                        },
                    },
                },
                customer: {
                    select: {
                        id: true,
                        businessName: true,
                        name: true,
                    },
                },
                salesRep: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            // const productions =
        });
        return {
            data: data.map((order) => {
                return {
                    ...order,
                    _meta: {
                        totalDoors: sum(
                            order.isDyke
                                ? order.doors.map((d) =>
                                      sum([d.lhQty, d.rhQty])
                                  )
                                : order.items.map((i) => i.qty)
                        ),
                    },
                };
            }),
            pageCount,
        };
    });
}
