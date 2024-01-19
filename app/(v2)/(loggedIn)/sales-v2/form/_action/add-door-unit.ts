"use server";

import { DykeForm } from "../../type";
import { getStepForm } from "./get-dyke-step";

export async function addDoorUnitAction(): Promise<
    Partial<DykeForm["itemArray"][0]>
> {
    const { step, ...item } = await getStepForm(1);
    return {
        opened: true,
        stepIndex: 0,
        item: {
            formStepArray: [
                {
                    item: {
                        ...item,
                    } as any,
                    step: step as any,
                },
            ],
            shelfItemArray: [
                {
                    productArray: [],
                    categoryIds: [-1],
                    categoryId: null,
                },
            ],
        },
    } as any;
}
