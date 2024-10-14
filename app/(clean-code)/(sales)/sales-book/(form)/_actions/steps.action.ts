"use server";

import {
    loadStepComponentsDta,
    LoadStepComponentsProps,
} from "../../../_common/data-access/step-components.persistent";

export async function getStepComponents(props: LoadStepComponentsProps) {
    return await loadStepComponentsDta(props);
}
