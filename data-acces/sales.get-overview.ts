import {
    composeSalesCostBreakdown,
    composeSalesInformation,
} from "@/data/compose-sales";
import { prisma } from "@/db";
import { IAddressMeta, ISalesOrderMeta, ISalesType } from "@/types/sales";
import { Prisma } from "@prisma/client";

export type IGetFullSale = Awaited<ReturnType<typeof getSale>>;

export async function getSalesOverviewPage(type: ISalesType, slug) {
    const sale = await getSale(type, slug);

    return {
        breakdown: composeSalesCostBreakdown(sale),
        info: composeSalesInformation(sale),
    };
}
export async function getSale(type: ISalesType, slug) {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            type,
            slug,
        },
        include: SalesIncludeAll,
    });
    const shippingAddress = {
        ...(sale.shippingAddress || {}),
        meta: sale.shippingAddress?.meta as any as IAddressMeta,
    };
    const billingAddress = {
        ...(sale.billingAddress || {}),
        meta: sale.billingAddress?.meta as any as IAddressMeta,
    };
    return {
        ...sale,
        type: sale.type as ISalesType,
        meta: sale.meta as any as ISalesOrderMeta,
        shippingAddress,
        billingAddress,
    };
}
export const SalesIncludeAll: Prisma.SalesOrdersInclude = {
    items: {
        where: { deletedAt: null },
        include: {
            shelfItems: {
                where: { deletedAt: null },
                include: {
                    shelfProduct: true,
                },
            },
            formSteps: {
                where: { deletedAt: null },
                include: {
                    step: {
                        select: {
                            id: true,
                            title: true,
                            value: true,
                        },
                    },
                },
            },
            housePackageTool: {
                where: { deletedAt: null },
                include: {
                    casing: true,
                    door: {
                        where: {
                            deletedAt: null,
                        },
                    },
                    jambSize: true,
                    doors: {
                        where: { deletedAt: null },
                    },
                    molding: {
                        where: { deletedAt: null },
                    },
                },
            },
        },
    },
    customer: true,
    shippingAddress: true,
    billingAddress: true,
    producer: true,
    salesRep: true,
    productions: true,
    payments: true,
    stat: true,
};
