import { AsyncFnType } from "@/app/(clean-code)/type";
import { prisma } from "@/db";

export type GetPricingList = AsyncFnType<typeof getPricingListDta>;
export async function getPricingListDta() {
    const pricings = await prisma.dykePricingSystem.findMany({
        select: {
            id: true,
            dependenciesUid: true,
            price: true,
            stepProductUid: true,
        },
    });
    return pricings;
}
