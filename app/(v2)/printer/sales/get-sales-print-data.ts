"use server";

import { prisma } from "@/db";
import { SalesPrintProps } from "./page";
import { viewSale } from "../../(loggedIn)/sales-v2/overview/_actions/get-sales-overview";
import { composeSalesItems } from "../../(loggedIn)/sales-v2/_utils/compose-sales-items";
import { composePrint } from "./compose-print";

export async function getSalesPrintData(
    slug,
    query: SalesPrintProps["searchParams"]
) {
    const resp = {};

    const order = await viewSale(null, slug);
    const salesitems = composeSalesItems(order);
    // const billingMeta = order.billingAddress?.meta as any as IAddressMeta;

    const estimate = order.type == "estimate";

    return composePrint(
        {
            order,
            ...salesitems,
        },
        query
    );
}
