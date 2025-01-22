"use server";

import { authId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { getSalesAssignmentsByUidAction } from "../production-actions/item-assignments-action";
import { getItemControlAction } from "../item-control.action";

export interface CreateSalesDispatchData {
    items: {
        uid: string;
        rh: number;
        lh: number;
        qty: number;
        dispatchItemId?: number;
    }[];
    deliveryMode;
    driverId;
    status;
    salesId;
}
export async function createSalesDispatchAction(data: CreateSalesDispatchData) {
    return await prisma.$transaction((async (tx: typeof prisma) => {
        const { deliveryMode, salesId, driverId, status } = data;
        const dispatch = await tx.orderDelivery.create({
            data: {
                deliveryMode,
                createdBy: { connect: { id: await authId() } },
                driver: !driverId ? undefined : { connect: { id: driverId } },
                status,
                meta: {},
                order: { connect: { id: salesId } },
            },
        });
        await Promise.all(
            data.items.map(async (item) => {
                const dispatchables = await getItemDispatchableSubmissions(
                    item.uid
                );
            })
        );
        throw Error("DEBUG ERROR");
    }) as any);
}
async function getItemDispatchableSubmissions(cuid) {
    //
    const control = await getItemControlAction(cuid);
    const { uidObj, assignments } = await getSalesAssignmentsByUidAction(cuid);
}
