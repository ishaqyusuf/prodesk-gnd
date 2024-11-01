"use server";

import { createCustomStepProductDta } from "../data-access/dyke-step-dta";

interface Props {
    title;
    price;
    dykeStepId;
    dependenciesUid;
}
export async function createCustomDykeStepUseCase(data: Props) {
    await createCustomStepProductDta(data);
}
