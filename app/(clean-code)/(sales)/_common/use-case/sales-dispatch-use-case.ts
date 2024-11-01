"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import { getSalesDispatchFormDta } from "../data-access/sales-dispatch-dta";

export type SalesDispatchForm = AsyncFnType<typeof salesDispatchFormUseCase>;
export async function salesDispatchFormUseCase(shipping) {
    return await getSalesDispatchFormDta(shipping);
}
export async function createSalesDispatchUseCase() {}
