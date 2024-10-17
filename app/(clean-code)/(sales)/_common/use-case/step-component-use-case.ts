"use server";

import { LabelValue } from "@/app/(clean-code)/type";
import {
    getDoorSizesDta,
    getDykeStepProductTitles,
    getDykeStepTitlesDta,
} from "../data-access/dyke-steps.persistent";

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
