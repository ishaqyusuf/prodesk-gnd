import { userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { SalesShippingDto } from "./dto/sales-shipping-dto";
import { Prisma } from "@prisma/client";
import { AsyncFnType } from "@/app/(clean-code)/type";
import { Qty, qtyDiff } from "./dto/sales-item-dto";
import { sum } from "@/lib/utils";
import {
    quickCreateAssignmentDta,
    submitAssignmentDta,
} from "./sales-prod.dta";
import { updateSalesProgressDta } from "./sales-progress.dta";
import { excludeDeleted } from "../utils/db-utils";

export type SalesDispatchFormData = AsyncFnType<typeof getSalesDispatchFormDta>;
export async function getSalesDispatchFormDta(shipping: SalesShippingDto) {
    return {
        toggleAll: false,
        shipping,
        delivery: {
            deliveryMode: shipping.deliveryMode,
            createdBy: {
                connect: {
                    id: await userId(),
                },
            },
            order: {
                connect: {
                    id: shipping.orderId,
                },
            },
        } satisfies Prisma.OrderDeliveryCreateInput,
        selection: {} as {
            [itemId in string]: {
                selected: boolean;
                itemId: number;
                deliveryQty: Qty;
                pendingAssignment: number;
                pendingProduction: number;
                assignedToId: number;
            };
        },
    };
}
type CreateManyDeliveryItem = Prisma.OrderItemDeliveryCreateManyInput;
export async function deleteSalesDispatchDta(id) {
    const d = await prisma.orderDelivery.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
        include: {
            items: {
                ...excludeDeleted,
            },
        },
    });
    let totalQty = sum(
        d.items.map((item) => sum([item.lhQty, item.rhQty]) || item.qty)
    );
    await prisma.orderItemDelivery.updateMany({
        where: {
            orderDeliveryId: d.id,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    await updateSalesProgressDta(d.salesOrderId, "dispatch", {
        minusScore: totalQty,
    });
}
export async function createSalesDispatchDta(data: SalesDispatchFormData) {
    const orderId = data.delivery.order.connect.id;
    const __items = Object.values(data.selection).filter((s) => s.selected);
    if (__items.length == 0)
        throw new Error("Select atleast one item to create a shipping");
    const dispatch = await prisma.orderDelivery.create({
        data: data.delivery,
    });
    const deliveries = await Promise.all(
        __items.map(async (selection) => {
            const dispItem = {
                orderId,
                orderItemId: selection.itemId,
                orderDeliveryId: dispatch.id,
            } satisfies CreateManyDeliveryItem;
            const { analytics, deliverableSubmissions, assignments } =
                data.shipping.dispatchableItemList.find(
                    (item) => item.id == selection.itemId
                );
            let qty = selection.deliveryQty; //{lh:10,rh:5}
            // qty.
            const hasHandle = qty.lh || qty.rh;
            const createManyData: CreateManyDeliveryItem[] = [];
            function updateHandleQty(sub, res, subId?) {
                let resp: CreateManyDeliveryItem | undefined = null;
                function updateItemDelivery(key, value) {
                    if (!resp)
                        resp = {
                            ...dispItem,
                        };
                    resp[key] = value;
                }
                (!hasHandle ? ["qty"] : ["lh", "rh"]).map((handl) => {
                    const key = hasHandle ? `${handl}Qty` : "qty";
                    const q = res[handl];
                    const subQ = sub[handl];
                    if (!qty[handl]) return;
                    console.log(q);

                    if (q <= 0) {
                        updateItemDelivery(key, qty[handl]);
                        qty[handl] = 0;
                        qty.total = 0;
                    } else {
                        qty[handl] -= subQ;
                        qty.total -= subQ;
                        updateItemDelivery(key, subQ);
                    }
                    // console.log(qty);
                });
                if (resp && subId) resp.orderProductionSubmissionId = subId;

                if (resp) {
                    if (hasHandle) resp.qty = sum([resp.lhQty, resp.rhQty]);
                    console.log(resp);

                    createManyData.push(resp);
                }
            }
            deliverableSubmissions.map((sub) => {
                const qtyRem = qtyDiff(qty, sub.qty, false);
                // console.log(qtyRem);
                // console.log(sub.qty);
                // console.log(qty);

                updateHandleQty(sub.qty, qtyRem, sub.subId);
            });
            // console.log({
            //     qty,
            //     createManyData,
            // });
            // return { qty, createManyData };
            if (qty.total > 0) {
                const assignment = await quickCreateAssignmentDta({
                    produceable: false,
                    qty,
                    itemId: selection.itemId,
                    orderId: data.delivery.order.connect.id,
                });
                const submission = await submitAssignmentDta(
                    {
                        qty: qty.total,
                        rhQty: qty.rh,
                        lhQty: qty.lh,
                        assignment: {
                            connect: {
                                id: assignment.id,
                            },
                        },
                        item: {
                            connect: {
                                id: assignment.itemId,
                            },
                        },
                        order: {
                            connect: {
                                id: assignment.orderId,
                            },
                        },
                    },
                    false
                );
                const subQty = {
                    lh: submission.lhQty,
                    rh: submission.rhQty,
                    qty: hasHandle ? 0 : submission.qty,
                    total: submission.qty,
                };
                const qtyRem = qtyDiff(qty, subQty, false);
                updateHandleQty(subQty, qtyRem, submission.id);
            }
            // return;
            if (createManyData.length) {
                const totalQty = sum(createManyData.map((s) => s.qty));
                console.log(totalQty);
                // return;
                await prisma.orderItemDelivery.createMany({
                    data: createManyData,
                });
                await updateSalesProgressDta(
                    dispatch.salesOrderId,
                    "dispatch",
                    {
                        plusScore: totalQty,
                    }
                );
            }
        })
    );
    return {
        dispatch,
        deliveries,
    };
}
