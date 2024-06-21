"use server";

import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import {
    DeliveryOption,
    IAddressBook,
    IAddressMeta,
    ISalesType,
} from "@/types/sales";
import { userId } from "@/app/(v1)/_actions/utils";
import { sum } from "@/lib/utils";
import salesData from "../../../sales/sales-data";
import { dateEquals } from "@/app/(v1)/_actions/action-utils";
import dayjs from "dayjs";
import { formatDate } from "@/lib/use-day";
import { ICustomer } from "@/types/customers";
interface Props {
    production?: boolean;
    query?: {
        _q?: string;
        dueToday?;
        deliveryOption?: DeliveryOption;
    };
}
export async function _getProductionList({ query, production = false }: Props) {
    const authId = await userId();
    const searchQuery = query?._q ? { contains: query?._q } : undefined;
    const dueDate = query?.dueToday
        ? dateEquals(formatDate(dayjs(), "YYYY-MM-DD"))
        : undefined;

    // console.log(dueDate);
    // return prisma.$transaction(async (tx) => {
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
                      assignedToId: !production ? undefined : authId,
                      dueDate,
                  },
              },
          }
        : {
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
        prisma.salesOrders,
        where
    );
    const data = await prisma.salesOrders.findMany({
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
            billingAddress: {
                select: {
                    id: true,
                    name: true,
                    address1: true,
                    meta: true,
                },
            },
            shippingAddress: {
                select: {
                    id: true,
                    name: true,
                    phoneNo: true,

                    meta: true,
                    address1: true,
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
                            ? order.doors.map((d) => sum([d.lhQty, d.rhQty]))
                            : order.items.map((i) => i.qty)
                    ),
                },
                customer: {
                    ...order.customer,
                    meta: {
                        // ...(order.meta)
                    },
                },
                shippingAddress: {
                    ...order.shippingAddress,
                    meta: order.shippingAddress?.meta as any as IAddressMeta,
                },
            };
        }),
        pageCount,
    };
    // });
}
