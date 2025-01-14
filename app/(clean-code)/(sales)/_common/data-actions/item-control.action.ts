"use action";

import { Prisma } from "@prisma/client";
import {
    doorItemControlUid,
    itemControlUidObject,
} from "../utils/item-control-utils";
import { prisma } from "@/db";
import { QtyControlType } from "../../types";

export async function updateItemControlAction(
    data: Prisma.SalesItemControlCreateManyInput
) {}

export async function getItemControlAction(uid) {
    const obj = itemControlUidObject(uid);
}
export async function updateSalesItemControl(salesId) {
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: { id: salesId },
        select: {
            itemControls: true,
            stat: true,
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
                    housePackageTool: {
                        select: {
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
    const controls: {
        uid;
        qtyControls: (Omit<Prisma.QtyControlUpdateInput, "type"> & {
            type: QtyControlType;
        })[];
        data: Prisma.SalesItemControlUpdateInput;
    }[] = [];
    order.items.map((item) => {
        if (item?.housePackageTool) {
            if (item.housePackageTool?.doors?.length) {
                item.housePackageTool?.doors.map((door) => {
                    let controlUid = doorItemControlUid(
                        door.id,
                        door.dimension
                    );
                    controls.push({
                        uid: controlUid,
                        qtyControls: [
                            {
                                lh: door.lhQty,
                                rh: door.rhQty,
                                qty:
                                    !door.lhQty && !door.rhQty
                                        ? door.totalQty
                                        : 0,
                                type: "qty",
                            },
                        ],
                        data: {
                            // title: door.dimension
                            shippable: true,
                            produceable: true,
                        },
                    });
                });
            } else {
            }
        } else {
            //
        }
    });
}
