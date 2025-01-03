import { prisma } from "@/db";
import { SalesIncludeAll } from "../../utils/db-utils";
import { generateSalesId } from "./sales-id-dta";

export async function copySalesDta(id, as) {
    const sale = await prisma.salesOrders.findFirst({
        where: {
            id,
        },
        include: SalesIncludeAll,
    });
    const newSales = await prisma.$transaction((async (tx: typeof prisma) => {
        function connectOr(id) {
            return !id
                ? undefined
                : {
                      connect: {
                          id,
                      },
                  };
        }
        const orderId = await generateSalesId(as);
        const newSales = await tx.salesOrders.create({
            data: {
                orderId,
                slug: orderId,
                type: as,
                meta: sale.meta,
                shippingAddress: connectOr(sale.shippingAddressId),
                billingAddress: connectOr(sale.billingAddressId),
                customer: connectOr(sale.customerId),
                salesRep: connectOr(sale.salesRepId),
                amountDue: 0,
            },
        });
    }) as any);
}
