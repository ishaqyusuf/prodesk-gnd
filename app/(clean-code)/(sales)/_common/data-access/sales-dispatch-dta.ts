import { userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { SalesShippingDto } from "./dto/sales-shipping-dto";
import { Prisma } from "@prisma/client";
import { AsyncFnType } from "@/app/(clean-code)/type";
import { Qty } from "./dto/sales-item-dto";

type FormData = AsyncFnType<typeof getSalesDispatchFormDta>;
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
                available: Qty;
                pendingAssignment: number;
                pendingProduction: number;
                assignedToId: number;
            };
        },
    };
}
export async function createSalesDispatchDta(data: FormData) {
    const dispatch = await prisma.orderDelivery.create({
        data: data.delivery,
    });
    const deliveries = await Promise.all(
        Object.values(data.selection)
            .filter((s) => s.selected)
            .map(async (selection) => {
                const dispItem = {
                    order: {
                        connect: {
                            id: data.delivery.order.connect.id,
                        },
                    },
                    items: {
                        connect: {
                            id: selection.itemId,
                        },
                    },
                    // submission: {
                    //     // connect: {},
                    // },
                } satisfies Prisma.OrderItemDeliveryCreateInput;
            })
    );
}
