"use server";

import { prisma } from "@/db";
import { QtyControlType } from "../../types";
import { updateSalesItemControlAction } from "./item-control.action";
import { percent, sum } from "@/lib/utils";

export async function updateSalesStatControlAction(salesId) {
    await updateSalesItemControlAction(salesId);
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: {
            id: salesId,
        },
        select: {
            stat: true,
            itemControls: {
                select: {
                    produceable: true,
                    shippable: true,
                    qtyControls: true,
                },
            },
        },
    });
    const itemControls = order.itemControls
        .map((a) => a.qtyControls)
        .flat()
        .map((c) => ({
            ...c,
            type: c.type as QtyControlType,
        }));
    const totalQty = sum(
        itemControls.filter((a) => a.type == "qty")?.map((a) => a.total)
    );
    const totalProduceable = sum(
        order.itemControls
            .filter((i) => i.produceable)
            .map((a) => a.qtyControls)
            .flat()
            .filter((a) => a.qty),
        "total"
    );
    const totalShippable = sum(
        order.itemControls
            .filter((i) => i.produceable)
            .map((a) => a.qtyControls)
            .flat()
            .filter((a) => a.qty),
        "total"
    );
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
