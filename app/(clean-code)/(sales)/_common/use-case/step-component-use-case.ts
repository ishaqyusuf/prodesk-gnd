"use server";

import { LabelValue } from "@/app/(clean-code)/type";
import {
    getDoorSizesDta,
    getDykeStepProductTitles,
    getDykeStepTitlesDta,
} from "../data-access/dyke-steps.persistent";
import {
    createStepComponentDta,
    loadStepComponentsDta,
    transformStepProduct,
    updateStepComponentDta,
} from "../data-access/step-components.dta";
import {
    deleteStepProductsByUidDta,
    getSalesFormStepByIdDta,
    getStepComponentsMetaByUidDta,
    updateStepComponentMetaDta,
    updateStepMetaDta,
} from "../data-access/sales-form-step-dta";
import { SalesFormZusData, StepComponentForm } from "../../types";
import {
    harvestSalesPricingDta,
    saveHarvestedDta,
} from "../data-access/sales-pricing-dta";

export async function getMouldingSpeciesUseCase() {
    return await getDykeStepProductTitles("Specie");
}
export async function getDoorSizesUseCase(height) {
    return await getDoorSizesDta(height);
}
export async function getDykeStepTitlesOptionUseCase() {
    const resp = await getDykeStepTitlesDta();
    return resp.map(
        ({ id, title }) =>
            ({
                label: title,
                value: id,
            } as LabelValue)
    );
}
export async function sortStepComponentsUseCase(components) {
    await Promise.all(
        components.map(async (c, index) => {
            const data = { sortIndex: index };
            await updateStepComponentDta(c.id, data);
        })
    );
}
export async function getStepComponentsUseCase(stepTitle, stepId) {
    return await loadStepComponentsDta({ stepTitle, stepId });
}
interface GetNextStepProps {
    nextStepId;
    // currentStepTitle;
}
export async function getNextStepUseCase({
    nextStepId,
}: GetNextStepProps): Promise<SalesFormZusData["kvStepForm"][number]> {
    const step = await getSalesFormStepByIdDta(nextStepId);
    return {
        componentUid: null,
        title: step.step.title,
        value: "",
        // price: null,
        basePrice: null,
        salesPrice: null,
        stepFormId: null,
        stepId: step.step.id,
        meta: step.step.meta as any,
    };
}
export async function deleteStepComponentsUseCase(uids: string[]) {
    return await deleteStepProductsByUidDta(uids);
}
export async function saveComponentVariantUseCase(uids, variants) {
    const products = await getStepComponentsMetaByUidDta(uids);
    await Promise.all(
        products.map(async (product) => {
            if (!product.meta) product.meta = {};
            product.meta.variations = variants;
            const resp = await updateStepComponentMetaDta(
                product.id,
                product.meta
            );
        })
    );
    return {
        variants,
        uids,
    };
}
// export async function saveDoorSizeVariants
export async function updateStepMetaUseCase(id, meta) {
    return await updateStepMetaDta(id, meta);
}
export async function harvestDoorPricingUseCase() {
    const val = await harvestSalesPricingDta();
    return val;
}
export async function saveHarvestedDoorPricingUseCase(ls) {
    const val = await saveHarvestedDta(ls);
    return val;
}
export async function saveComponentRedirectUidUseCase(id, redirectUid) {
    await updateStepComponentDta(id, { redirectUid });
}
export async function createComponentUseCase(data: StepComponentForm) {
    const c = await createStepComponentDta(data);
    const resp = transformStepProduct(c as any);
    return resp;
}
