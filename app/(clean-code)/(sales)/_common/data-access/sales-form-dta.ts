import { DykeForm as OldDykeForm } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { ComponentPrice } from "@prisma/client";

export type DykeForm = OldDykeForm;

export async function saveSalesComponentPricing(
    prices: Partial<ComponentPrice>[],
    orderId
) {
    // console.log(prices);
    return;
    const ids = [];
    const filterPrices = prices.filter((p) => p.qty);
    await Promise.all(
        filterPrices
            .filter((p) => p.qty)
            .map(async (price) => {
                price.salesProfit = price.salesTotalCost - price.baseTotalCost;
                if (!price.type) price.type = "...";
                const s = await prisma.componentPrice.upsert({
                    create: {
                        ...(price as any),
                    },
                    update: {
                        ...price,
                    },
                    where: {
                        id: price.id,
                    },
                });
                ids.push(s.id);
            })
    );
    const res = await prisma.componentPrice.updateMany({
        where: {
            salesId: orderId,
            id: {
                notIn: ids.filter((id) => id > 0),
            },
        },
        data: {
            deletedAt: new Date(),
        },
    });
    console.log(res.count);

    console.log("DONE");
}
