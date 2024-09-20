"use server";

import { getSales } from "@/data-acces/sales";
import { BaseQuery } from "@/types/action";
import { DeliveryOption, ISalesType } from "@/types/sales";
import { Prisma } from "@prisma/client";

export interface SalesQueryParams extends BaseQuery {
    type: ISalesType;
    deliveryOption: DeliveryOption;
}

export type GetSalesAction = Awaited<ReturnType<typeof getSalesAction>>;
export async function getSalesAction(query: SalesQueryParams) {
    return await getSales(query);
}
