"use server";

import { LabelValue } from "@/app/(clean-code)/type";
import {
    getDoorSizesDta,
    getDykeStepProductTitles,
    getDykeStepTitlesDta,
} from "../data-access/dyke-steps.persistent";
import { updateStepComponentDta } from "../data-access/step-components.persistent";

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
