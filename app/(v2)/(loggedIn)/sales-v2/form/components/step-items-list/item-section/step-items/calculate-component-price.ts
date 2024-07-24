import {
    DykeStep,
    DykeStepMeta,
    FormStepArray,
} from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { IStepProducts } from ".";
import { getStepPricings } from "./_actions";
import { getDepsUid } from "./get-deps-uid";

interface Props {
    stepProducts: IStepProducts;
    stepForm: DykeStep;
    stepArray: FormStepArray;
    stepIndex;
}
export async function fetchStepComponentsPrice({
    stepProducts,
    stepForm,
    stepArray,
    stepIndex,
}: Props) {
    const depUid = getDepsUid(stepIndex, stepArray, stepForm);

    const pricings = await getStepPricings(depUid, stepForm.step.id);
    console.log({ pricings });

    stepProducts = stepProducts.map((product) => {
        if (product._estimate)
            product._estimate.price = pricings.pricesByUid[product.uid];
        return product;
    });
    return stepProducts;
}
