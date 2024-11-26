"use server";

import { LabelValue } from "@/app/(clean-code)/type";
import {
    getDoorSizesDta,
    getDykeStepProductTitles,
    getDykeStepTitlesDta,
} from "../data-access/dyke-steps.persistent";
import { updateStepComponentDta } from "../data-access/step-components.persistent";
import {
    deleteStepProductsByUidDta,
    getSalesFormStepByIdDta,
    getStepComponentsDta,
} from "../data-access/sales-form-step-dta";
import { SalesFormZusData } from "../../types";

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
    return await getStepComponentsDta(stepTitle, stepId);
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
        title: step.step.title,
        value: "",
        price: null,
        stepFormId: null,
        stepId: step.step.id,
        isHpt: false,
        isService: false,
    };
}
export async function deleteStepProductsUseCase(uids: string[]) {
    return await deleteStepProductsByUidDta(uids);
}
