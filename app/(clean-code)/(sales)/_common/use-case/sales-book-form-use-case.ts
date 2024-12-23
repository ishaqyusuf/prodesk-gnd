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
import { composeSalesPricing } from "../utils/sales-pricing-utils";
import { getPricingListDta } from "../data-access/sales-pricing-dta";
import { SalesFormFields } from "../../types";
import { saveSalesFormDta } from "../data-access/save-sales/index.dta";
import { zhInitializeState } from "../../sales-book/(form)/_utils/helpers/zus/zus-form-helper";

export type GetSalesBookForm = AsyncFnType<typeof getSalesBookFormUseCase>;
export async function getSalesBookFormUseCase(data: GetSalesBookFormDataProps) {
    const result = await getTransformedSalesBookFormDataDta(data);
    return await composeBookForm(result);
}
async function composeBookForm<T>(data: T) {
    return {
        ...data,
        salesSetting: composeStepRouting(await loadSalesFormData()),
        pricing: composeSalesPricing(await getPricingListDta()),
    };
}
export async function createSalesBookFormUseCase(
    data: GetSalesBookFormDataProps
) {
    const resp = await createSalesBookFormDataDta(data);
    return await composeBookForm(resp);
    // return salesFormZustand(resp);
    // return {
    //     ...resp,
    //     salesSetting: composeStepRouting(await loadSalesFormData()),
    // };
}
export async function saveSalesSettingUseCase(meta) {
    await saveSalesSettingData(meta);
}
export async function saveFormUseCase(
    data: SalesFormFields,
    oldFormState?: SalesFormFields,
    allowRedirect = true
) {
    if (!oldFormState)
        oldFormState = {
            kvFormItem: {},
            kvStepForm: {},
            sequence: {
                formItem: [],
                multiComponent: {},
                stepComponent: {},
            },
            metaData: {} as any,
        };
    return await saveSalesFormDta(data, oldFormState, allowRedirect);
}

export async function copySalesUseCase(orderId, as) {
    const form = await getSalesBookFormUseCase({
        slug: orderId,
    });

    form.order.type = as;
    const formData = zhInitializeState(form, true);
    const { kvFormItem, kvStepForm, metaData, sequence } = formData;
    console.log(formData.oldFormState);

    const resp = await saveFormUseCase(
        {
            kvFormItem,
            kvStepForm,
            metaData,
            sequence,
        },
        formData.oldFormState,
        false
    );

    return {
        link: `/sales-book/edit-${as}/${resp.slug}`,
    };
}
