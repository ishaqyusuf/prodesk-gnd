import { prisma } from "@/db";
import { SalesType } from "../../types";
const type = "sales-page-setting";

export async function truncateSalesPageDataDta() {
    await prisma.settings.deleteMany({
        where: {
            type,
        },
    });
}
export async function getSalesPageQueryDataDta() {
    const pageCache = await prisma.settings.findFirst({
        where: {
            type,
            // createdAt: {
            //     gte: dayjs().add(5,'hour')
            // }
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    // if (pageCache?.meta) return pageCache?.meta as any;
    const sales = await prisma.salesOrders.findMany({
        where: {
            type: "order" as SalesType,
        },
        select: {
            orderId: true,
            meta: true,
            customer: {
                select: {
                    businessName: true,
                    name: true,
                    phoneNo: true,
                    address: true,
                },
            },
            billingAddress: {
                select: {
                    name: true,
                    phoneNo: true,
                    address1: true,
                },
            },
            salesRep: {
                select: {
                    name: true,
                },
            },
        },
    });
    const result = {
        orderId: sales.map((s) => s.orderId),
        phone: [
            ...new Set(
                sales
                    .map((s) => [
                        s.customer?.phoneNo,
                        s.billingAddress?.phoneNo,
                    ])
                    .flat()
                    .filter(Boolean)
            ),
        ],
        customer: [
            ...new Set(
                sales.map((s) =>
                    [s.customer?.name, s.customer?.businessName]
                        .flat()
                        .filter(Boolean)
                )
            ),
        ],
        rep: [...new Set(sales.map((s) => s.salesRep?.name)?.filter(Boolean))],
        po: [...new Set(sales.map((s) => (s.meta as any)?.po).filter(Boolean))],
    };
    await prisma.settings.create({
        data: {
            type,
            meta: result,
        },
    });
    return result;
}
