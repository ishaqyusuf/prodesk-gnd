"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { DykeDoorType } from "../../type";
import { salesAssignmentIncludes } from "./utils";
import { ISalesType } from "@/types/sales";

export async function _getProductionList({ query }) {
    const productionTypes = ["Interior", "Garage"] as DykeDoorType[];

    return prisma.$transaction(async (tx) => {
        const where: Prisma.SalesOrdersWhereInput = {
            isDyke: true,
            type: "order" as ISalesType,
            items: {
                some: {
                    salesDoors: {
                        some: {
                            doorType: {
                                in: productionTypes,
                            },
                        },
                    },
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
                productionStatus: true,
                doors: {
                    where: {
                        housePackageTool: {
                            door: {
                                doorType: {
                                    in: productionTypes,
                                },
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
                    where: { deletedAt: null },
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
                            select: {
                                id: true,
                                qty: true,
                                leftHandle: true,
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
                };
            }),
            pageCount,
        };
    });
}
