"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import {
    createSalesBookFormDataDta,
    GetSalesBookFormDataProps,
    getTransformedSalesBookFormDataDta,
} from "../data-access/sales-form-dta";
import { composeStepRouting } from "../utils/sales-step-utils";
import {
    loadSalesFormData,
    saveSalesSettingData,
} from "../data-access/sales-form-settings.dta";

export type GetSalesBookForm = AsyncFnType<typeof getSalesBookFormUseCase>;
export async function getSalesBookFormUseCase(data: GetSalesBookFormDataProps) {
    const result = await getTransformedSalesBookFormDataDta(data);
    return {
        ...result,
        salesSetting: composeStepRouting(await loadSalesFormData()),
    };
}
export async function createSalesBookFormUseCase(
    data: GetSalesBookFormDataProps
) {
    const resp = await createSalesBookFormDataDta(data);
    // return salesFormZustand(resp);
    return {
        ...resp,
        salesSetting: composeStepRouting(await loadSalesFormData()),
    };
}
export async function saveSalesSettingUseCase(meta) {
    await saveSalesSettingData(meta);
}
