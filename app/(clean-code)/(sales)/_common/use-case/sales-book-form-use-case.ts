"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import {
    createSalesBookFormDataDta,
    GetSalesBookFormDataProps,
    getTransformedSalesBookFormDataDta,
} from "../data-access/sales-form-dta";

export type GetSalesBookForm = AsyncFnType<typeof getSalesBookFormUseCase>;
export async function getSalesBookFormUseCase(data: GetSalesBookFormDataProps) {
    const result = await getTransformedSalesBookFormDataDta(data);
    return result;
}
export async function createSalesBookFormUseCase(
    data: GetSalesBookFormDataProps
) {
    const resp = await createSalesBookFormDataDta(data);
    // return salesFormZustand(resp);
    return resp;
}
