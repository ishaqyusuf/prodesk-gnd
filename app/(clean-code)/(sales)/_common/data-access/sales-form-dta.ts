import { DykeForm as OldDykeForm } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { ComponentPrice } from "@prisma/client";

export type DykeForm = OldDykeForm;

export async function saveSalesComponentPricing(
    prices: Partial<ComponentPrice>[]
) {
    // console.log(prices);
    await Promise.all(
        prices.map(async (price) => {
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
