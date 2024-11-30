import { AsyncFnType } from "@/app/(clean-code)/type";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export type GetPricingList = AsyncFnType<typeof getPricingListDta>;
export async function getPricingListDta(
    where: Prisma.DykePricingSystemWhereInput = {}
) {
    const pricings = await prisma.dykePricingSystem.findMany({
        where,
        select: {
            id: true,
            dependenciesUid: true,
            price: true,
            stepProductUid: true,
        },
    });
    return pricings;
}
export async function getComponentPricingListByUidDta(stepProductUid) {
    return await getPricingListDta({
        stepProductUid,
    });
}
export async function saveComponentPricingsDta(
    data: Prisma.DykePricingSystemCreateManyInput[]
) {
    const newData = data.filter((a) => !a.id).map(({ id, ...rest }) => rest);

    if (newData.length) {
        const resp = await prisma.dykePricingSystem.createMany({
            data: newData,
        });
    }
    const updateByPrice: { [price in string]: number[] } = {};
    data.filter((d) => d.id).map((p) => {
        const k = !p.price ? "del" : p.price;
        if (updateByPrice[k]) updateByPrice[k].push(p.id);
        else updateByPrice[k] = [p.id];
    });
    await Promise.all(
        Object.entries(updateByPrice).map(async ([price, ids]) => {
            await prisma.dykePricingSystem.updateMany({
                where: { id: { in: ids } },
                data: {
                    price: price == "del" ? null : Number(price),
                },
            });
        })
    );
    return {
        status: "success",
    };
}
