import { DykeForm as OldDykeForm } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { ComponentPrice } from "@prisma/client";

export type DykeForm = OldDykeForm;

export async function saveSalesComponentPricing(
    prices: Partial<ComponentPrice>[]
) {
    // console.log(prices);
    // return;
    const filterPrices = prices.filter((p) => p.qty);
    await Promise.all(
        filterPrices
            .filter((p) => p.qty)
            .map(async (price) => {
                price.salesProfit = price.salesTotalCost - price.baseTotalCost;
                await prisma.componentPrice.upsert({
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
            })
    );
    console.log("DONE");
}
