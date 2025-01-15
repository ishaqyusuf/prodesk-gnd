"use action";

import { Prisma } from "@prisma/client";
import {
    doorItemControlUid,
    itemControlUidObject,
    itemItemControlUid,
    mouldingItemControlUid,
} from "../utils/item-control-utils";
import { prisma } from "@/db";
import {
    QtyControlByType,
    QtyControlType,
    SalesDispatchStatus,
} from "../../types";
import { AsyncFnType } from "@/types";
import { sum } from "@/lib/utils";

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
            itemControls: true,
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
    return order;
}
interface ComposeQtyControlProps {
    order: GetSalesItemControllables;
    itemId: number;
    doorId?: number;
    controlUid: string;
    lh?;
    rh?;
    qty?;
}
function composeQtyControl(props: ComposeQtyControlProps) {
    const controls: QtyControlByType = {} as any;
    controls.qty = {
        qty: props.qty,
        lh: props.lh,
        rh: props.rh,
        type: "qty",
        itemControl: {
            connect: {
                uid: props.controlUid,
            },
        },
    };
    let assignments = props.order.assignments.filter((a) =>
        props.doorId ? a.salesDoorId == props.doorId : a.itemId == props.itemId
    );
    const singleHandle = assignments?.every((a) => !a.lhQty && !a.rhQty);
    controls.prodAssigned = {
        lh: sum(assignments, "lhQty"),
        rh: sum(assignments, "rhQty"),
        qty: singleHandle ? sum(assignments, "qtyAssigned") : 0,
        type: "prodAssigned",
        itemControl: {
            connect: {
                uid: props.controlUid,
            },
        },
    };
    const submissions = assignments.map((a) => a.submissions).flat();
    controls.prodCompleted = {
        lh: sum(submissions, "lhQty"),
        rh: sum(submissions, "rhQty"),
        qty: singleHandle ? sum(submissions, "qty") : 0,
        type: "prodCompleted",
        itemControl: {
            connect: {
                uid: props.controlUid,
            },
        },
    };
    const deliveries = props.order.deliveries.map((d) => {
        return { ...d, status: d.status as SalesDispatchStatus };
    });
    const dispatches = submissions.map((s) => s.itemDeliveries).flat();
    function registerDispatch(
        status: SalesDispatchStatus,
        controlType: QtyControlType
    ) {
        // const deliveries  =
    }
    controls.dispatchAssigned = {
        lh: sum(dispatches, "lhQty"),
        rh: sum(dispatches, "rhQty"),
        qty: singleHandle ? sum(dispatches, "qty") : 0,
        type: "dispatchAssigned",
        itemControl: {
            connect: {
                uid: props.controlUid,
            },
        },
    };
}
export async function updateSalesItemControl(salesId) {
    const order = await getSalesItemControllablesInfoAction(salesId);
    const controls: {
        uid;
        qtyControls: QtyControlByType["qty"][];
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
                            subtitle: `${door.dimension}`,
                            shippable: true,
                            produceable: true,
                        },
                    });
                });
            } else {
                let controlUid = mouldingItemControlUid(
                    item.id,
                    item.housePackageTool.id
                );
                controls.push({
                    uid: controlUid,
                    data: {
                        shippable: true,
                        produceable: true,
                        title: `${
                            item.housePackageTool?.stepProduct?.name ||
                            item.housePackageTool?.stepProduct?.product?.title
                        }`,
                    },
                    qtyControls: [
                        {
                            qty: item.qty,
                            type: "qty",
                            itemControl: {
                                connect: {
                                    uid: controlUid,
                                },
                            },
                        },
                    ],
                });
            }
        } else {
            let controlUid = itemItemControlUid(item.id);
            controls.push({
                uid: controlUid,
                data: {
                    shippable: true,
                    produceable: true,
                    title: `${item.description}`,
                },
                qtyControls: [
                    {
                        qty: item.qty,
                        type: "qty",
                        itemControl: {
                            connect: {
                                uid: controlUid,
                            },
                        },
                    },
                ],
            });
        }
    });
}
