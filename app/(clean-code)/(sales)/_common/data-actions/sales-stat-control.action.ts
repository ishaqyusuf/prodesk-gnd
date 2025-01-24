"use server";

import { prisma } from "@/db";
import { QtyControlType } from "../../types";
import { updateSalesItemControlAction } from "./item-control.action";
import { percent, sum } from "@/lib/utils";

export async function validateSalesStatControlAction(salesId) {
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: { id: salesId },
        select: {
            itemControls: {
                select: {
                    qtyControls: {
                        select: {
                            type: true,
                        },
                    },
                },
            },
        },
    });
    const qtyControls = order.itemControls
        .map((i) => i.qtyControls)
        .flat().length;
    if (!qtyControls) {
        await resetSalesStatAction(salesId);
    }
}
export async function updateSalesStatControlAction(salesId) {
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: {
            id: salesId,
        },
        select: {
            stat: true,
            itemControls: {
                where: {
                    deletedAt: null,
                },
                select: {
                    produceable: true,
                    shippable: true,
                    qtyControls: true,
                },
            },
        },
    });
    console.log(order.itemControls);

    const itemControls = order.itemControls
        .map((a) => a.qtyControls)
        .flat()
        .map((c) => ({
            ...c,
            type: c.type as QtyControlType,
        }));

    const totalProduceable = sum(
        order.itemControls
            .filter((i) => i.produceable)
            .map((a) => a.qtyControls)
            .flat()
            .filter((a) => a.total),
        "total"
    );
    const totalShippable = sum(
        order.itemControls
            .filter((i) => i.shippable)
            .map((a) => a.qtyControls)
            .flat()
            .filter((a) => a.total),
        "total"
    );
    console.log({
        totalProduceable,
        totalShippable,
    });

    async function createStat(type: QtyControlType, total) {
        const score = sum(
            itemControls.filter((a) => a.type == type),
            "total"
        );
        const percentage = percent(score, total);
        await prisma.salesStat.upsert({
            where: {
                salesId_type: {
                    type,
                    salesId,
                },
            },
            create: {
                type,
                salesId,
                percentage,
                score,
                total,
            },
            update: {
                percentage,
                score,
                total,
            },
        });
    }
    await createStat("dispatchAssigned", totalShippable);
    await createStat("dispatchCompleted", totalShippable);
    await createStat("dispatchInProgress", totalShippable);
    await createStat("prodAssigned", totalProduceable);
    await createStat("prodCompleted", totalProduceable);
}
export async function resetSalesStatAction(salesId) {
    // const resp = await prisma.qtyControl.deleteMany({
    //     where: {
    //         itemControl: {
    //             salesId,
    //         },
    //     },
    // });
    // const _resp = await prisma.salesItemControl.deleteMany({
    //     where: { salesId },
    // });
    // console.log({ resp, _resp });

    await updateSalesItemControlAction(salesId);
    await updateSalesStatControlAction(salesId);
}
