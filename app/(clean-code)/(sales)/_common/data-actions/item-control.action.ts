"use server";

import { Prisma } from "@prisma/client";
import {
    composeControls,
    itemControlUidObject,
    qtyControlsByType,
} from "../utils/item-control-utils";
import { prisma } from "@/db";
import { QtyControlType, SalesDispatchStatus } from "../../types";
import { AsyncFnType } from "@/types";
import { updateSalesStatControlAction } from "./sales-stat-control.action";
import { percent, sum } from "@/lib/utils";

export async function updateItemControlAction(
    uid,
    data: Prisma.SalesItemControlUpdateInput
) {
    const resp = await prisma.salesItemControl.update({
        where: {
            uid,
        },
        data: {
            produceable: data.produceable,
            shippable: data.shippable,
        },
    });
    await updateItemQtyControlsAction(uid);
    await updateSalesStatControlAction(resp.salesId);
}
export async function updateQtyControlAction(
    uid,
    type: QtyControlType,
    { qty, lh, rh, totalQty }
) {
    const qtyControl = await prisma.qtyControl.upsert({
        where: {
            itemControlUid_type: {
                itemControlUid: uid,
                type,
            },
        },
        create: {
            type,
            itemControlUid: uid,
        },
        update: {},
    });
    // console.log(qtyControl, { qty, lh, rh, totalQty });
    if (!qtyControl) throw new Error("Not found");
    qtyControl.rh = sum([qtyControl.rh, rh]);
    qtyControl.lh = sum([qtyControl.lh, lh]);
    qtyControl.qty = sum([qtyControl.qty, qty]);
    qtyControl.total = sum([qtyControl.qty, qtyControl.rh, qtyControl.lh]);
    qtyControl.percentage = percent(qtyControl.total, totalQty);

    if (qtyControl.percentage > 100 || qtyControl.percentage < 0)
        throw new Error("Error performing action");
    await prisma.qtyControl.updateMany({
        where: {
            itemControlUid: uid,
            type,
        },
        data: {
            rh: qtyControl.rh,
            lh: qtyControl.lh,
            qty: qtyControl.qty,
            total: qtyControl.total,
            percentage: qtyControl.percentage,
        },
    });
}
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
                where: { deletedAt: null },
                select: {
                    lhQty: true,
                    rhQty: true,
                    qtyAssigned: true,
                    itemId: true,
                    salesDoorId: true,
                    submissions: {
                        where: { deletedAt: null },
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
                where: { deletedAt: null },
                select: {
                    swing: true,
                    qty: true,
                    id: true,
                    description: true,
                    dykeDescription: true,
                    housePackageTool: {
                        where: { deletedAt: null },
                        select: {
                            stepProduct: {
                                where: { deletedAt: null },
                                select: {
                                    name: true,
                                    product: {
                                        where: { deletedAt: null },
                                        select: {
                                            title: true,
                                        },
                                    },
                                    door: {
                                        where: { deletedAt: null },
                                        select: {
                                            title: true,
                                        },
                                    },
                                },
                            },
                            molding: {
                                where: { deletedAt: null },
                                select: {
                                    title: true,
                                },
                            },
                            door: {
                                where: { deletedAt: null },
                                select: {
                                    title: true,
                                },
                            },
                            id: true,
                            moldingId: true,
                            doors: {
                                where: { deletedAt: null },
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
export async function updateItemQtyControlsAction(uid) {
    const control = await prisma.salesItemControl.findFirstOrThrow({
        where: { uid },
        include: {
            qtyControls: true,
        },
    });
    const qtyControls = qtyControlsByType(control.qtyControls);
    const qty = qtyControls.qty;
}
export async function updateSalesItemControlAction(salesId) {
    const order = await getSalesItemControllablesInfoAction(salesId);
    const controls = composeControls(order);

    const resp = await prisma.$transaction((async (tx: typeof prisma) => {
        const del = await tx.qtyControl.deleteMany({
            where: {
                itemControl: {
                    salesId: order.id,
                },
            },
        });
        const arr = await Promise.all(
            controls.map(async (c) => {
                if (c.create)
                    return await tx.salesItemControl.create({ data: c.create });
                if (c.update)
                    return await tx.salesItemControl.update({
                        data: c.update,
                        where: {
                            uid: c.uid,
                        },
                    });
            })
        );
        return { del, arr };
    }) as any);

    return resp;
}
