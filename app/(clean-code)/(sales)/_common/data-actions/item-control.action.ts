"use server";

import { Prisma } from "@prisma/client";
import {
    composeControls,
    itemControlUidObject,
} from "../utils/item-control-utils";
import { prisma } from "@/db";
import { SalesDispatchStatus } from "../../types";
import { AsyncFnType } from "@/types";

export async function updateItemControlAction(
    data: Prisma.SalesItemControlCreateManyInput
) {}

export async function getItemControlAction(uid) {
    const obj = itemControlUidObject(uid);
}

export type GetSalesItemControllables = AsyncFnType<
    typeof getSalesItemControllablesInfoAction
>;
export async function getSalesItemControllablesInfoAction(salesId) {
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: { id: salesId },
        select: {
            id: true,
            itemControls: {
                include: {
                    qtyControls: true,
                },
            },
            stat: true,
            deliveries: {
                select: {
                    id: true,
                    status: true,
                },
            },
            assignments: {
                select: {
                    lhQty: true,
                    rhQty: true,
                    qtyAssigned: true,
                    itemId: true,
                    salesDoorId: true,
                    submissions: {
                        select: {
                            qty: true,
                            rhQty: true,
                            lhQty: true,
                            itemDeliveries: {
                                select: {
                                    status: true,
                                    orderDeliveryId: true,
                                    qty: true,
                                    lhQty: true,
                                    rhQty: true,
                                },
                            },
                        },
                    },
                },
            },
            items: {
                select: {
                    qty: true,
                    id: true,
                    description: true,
                    dykeDescription: true,
                    housePackageTool: {
                        select: {
                            stepProduct: {
                                select: {
                                    name: true,
                                    product: {
                                        select: {
                                            title: true,
                                        },
                                    },
                                    door: {
                                        select: {
                                            title: true,
                                        },
                                    },
                                },
                            },
                            molding: {
                                select: {
                                    title: true,
                                },
                            },
                            door: {
                                select: {
                                    title: true,
                                },
                            },
                            id: true,
                            moldingId: true,
                            doors: {
                                select: {
                                    dimension: true,
                                    id: true,
                                    lhQty: true,
                                    rhQty: true,
                                    totalQty: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    return {
        ...order,
        deliveries: order.deliveries.map((d) => {
            return {
                ...d,
                status: d.status as SalesDispatchStatus,
            };
        }),
        assignments: order.assignments.map((a) => {
            return {
                ...a,

                submissions: a.submissions.map((s) => {
                    return {
                        ...s,
                        itemDeliveries: s.itemDeliveries.map((d) => {
                            return {
                                ...d,
                                status: d.status as SalesDispatchStatus,
                            };
                        }),
                    };
                }),
            };
        }),
    };
}

export async function updateSalesItemControlAction(salesId) {
    const order = await getSalesItemControllablesInfoAction(salesId);
    const controls = composeControls(order);
    // const createItemControlsData = controls
    // .filter((s) => s.create)
    // .map((s) => s.create);
    // if (createItemControlsData.length)
    //     await prisma.salesItemControl.createMany({
    //         data: createItemControlsData,
    //     });
    // const _ = await prisma.qtyControl.deleteMany({
    //     where: {
    //         itemControl: {
    //             salesId: order.id,
    //         },
    //     },
    // });
    // console.log()
    const resp = await prisma.$transaction([
        prisma.qtyControl.deleteMany({
            where: {
                itemControl: {
                    salesId: order.id,
                },
            },
        }),
        ...controls.map((c) => {
            if (c.create)
                return prisma.salesItemControl.create({ data: c.create });
            if (c.update)
                return prisma.salesItemControl.update({
                    data: c.update,
                    where: {
                        uid: c.uid,
                    },
                });
        }),
    ]);
    return resp;
}
