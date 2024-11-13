"use server";

import {
    createSalesDispatchDta,
    deleteSalesDispatchDta,
    getSalesDispatchFormDta,
    SalesDispatchFormData,
} from "../data-access/sales-dispatch-dta";

export type SalesDispatchForm = SalesDispatchFormData;
export async function salesDispatchFormUseCase(shipping) {
    return await getSalesDispatchFormDta(shipping);
}
export async function createSalesDispatchUseCase(data: SalesDispatchForm) {
    return await createSalesDispatchDta(data);
}
export async function deleteSalesDispatchUseCase(id) {
    return await deleteSalesDispatchDta(id);
}
