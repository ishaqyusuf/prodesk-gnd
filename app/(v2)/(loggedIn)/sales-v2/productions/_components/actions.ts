"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { ISalesType } from "@/types/sales";
import { userId } from "@/app/(v1)/_actions/utils";
import { sum } from "@/lib/utils";
import salesData from "../../../sales/sales-data";
import { dateEquals } from "@/app/(v1)/_actions/action-utils";
import dayjs from "dayjs";
interface Props {
    production?: boolean;
    query?: {
        _q?: string;
        dueToday?;
    };
}
export async function _getProductionList({ query, production = false }: Props) {
    const authId = await userId();
    const searchQuery = query?._q ? { contains: query?._q } : undefined;
    const dueDate = query?.dueToday ? dateEquals(dayjs()) : undefined;
    // console.log(dueDate);

    return prisma.$transaction(async (tx) => {
        const itemsFilter: Prisma.SalesOrderItemsListRelationFilter = {
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
        };
        const where: Prisma.SalesOrdersWhereInput = query?.dueToday
            ? {
                  items: itemsFilter,
                  assignments: {
                      some: {
                          assignedToId: authId,
                          dueDate,
                      },
                  },
              }
            : {
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
                                dueDate,
                            },
                        }
                      : undefined,

                  items: itemsFilter,
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
        // console.log(data[0]);
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
