"use server";

import { AsyncFnType } from "@/app/(clean-code)/type";
import {
    createSalesBookFormDataDta,
    GetSalesBookFormDataProps,
    getTransformedSalesBookFormDataDta,
} from "../data-access/sales-form-dta";
import { composeStepRouting } from "../utils/sales-step-utils";
import { getStepsForRoutingDta } from "../data-access/sales-form-step-dta";

export type GetSalesBookForm = AsyncFnType<typeof getSalesBookFormUseCase>;
export async function getSalesBookFormUseCase(data: GetSalesBookFormDataProps) {
    const result = await getTransformedSalesBookFormDataDta(data);
    return {
        ...result,
        stepRoute: composeStepRouting(await getStepsForRoutingDta()),
    };
}
export async function createSalesBookFormUseCase(
    data: GetSalesBookFormDataProps
) {
    const resp = await createSalesBookFormDataDta(data);
    // return salesFormZustand(resp);
    return {
        ...resp,
        stepRoute: composeStepRouting(await getStepsForRoutingDta()),
    };
}
