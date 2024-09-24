import { prisma } from "@/db";
import { TypedSales } from "../../types";

export async function getSalesAnalyticsDta() {
    const s = await prisma.salesOrders.findMany({
        select: {
            id: true,
            type: true,
            deliveryOption: true,
            status: true,
            // assignments: {
            //     include: {
            //         _count: true,
            //     },
            // },
        },
    });
    const _ = s as Array<
        Pick<TypedSales, "deliveryOption" | "type"> & (typeof s)[number]
    >;
    return _;
    // _[0].deliveryOption
    // easiest way make deliveryOption typed as DeliveryOption, type as SalesType
}
