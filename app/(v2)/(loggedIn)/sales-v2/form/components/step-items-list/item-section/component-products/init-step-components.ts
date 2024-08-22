import {
    DykeStep,
    DykeStepMeta,
    FormStepArray,
} from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { IStepProducts } from ".";
import { getStepPricings } from "./_actions";

interface Props {
    stepProducts: IStepProducts;
    stepForm: DykeStep;
    stepArray: FormStepArray;
    stepIndex;
}
export async function initStepComponents({
    stepProducts,
    stepForm,
    stepArray,
    stepIndex,
}: Props) {
    const doorSection = stepForm.step.title == "Door";
    const depUid = getDepsUid(stepIndex, stepArray, stepForm);
    const pricings = await getStepPricings(depUid, stepForm.step.id);
    const _formSteps = getFormSteps(stepArray, stepIndex);
    const stateDeps = getDykeStepState(_formSteps, stepForm);

    stepProducts = stepProducts.map((product) => {
        if (product._metaData)
            product._metaData.price = pricings.pricesByUid[product.uid];
        const shows = product.meta?.show || {};
        let hasShow = Object.keys(shows).filter(Boolean).length;
        console.log({ hasShow, doorSection });

        let showThis = hasShow && stateDeps.some((s) => shows?.[s.key]);

        product._metaData.hidden = doorSection
            ? !showThis
            : product.deletedAt
            ? true
            : hasShow
            ? !showThis
            : stateDeps.some((s) => product.meta.deleted?.[s.key]);
        return product;
    });
    return stepProducts;
}
export function getFormSteps(formStepArray: FormStepArray, stepIndex) {
    const dependecies = formStepArray
        .map((s) => ({
            uid: s.step.uid,
            label: s.step.title,
            value: s.item.value,
            prodUid: s.item.prodUid,
        }))
        .filter((_, i) => i < stepIndex);
    return dependecies;
}
export function getDykeStepState(
    _formSteps: ReturnType<typeof getFormSteps>,
    stepForm: DykeStep
) {
    const stateDeps = stepForm.step.meta.stateDeps;
    let states: {
        step: (typeof _formSteps)[number];
        steps: typeof _formSteps;
        key: string;
    }[] = [];
    let stateBuilder = null;
    _formSteps.map((step) => {
        if (stateDeps?.[step.uid]) {
            stateBuilder = [stateBuilder, step.prodUid]
                .filter(Boolean)
                .join("-");
            states.push({
                step,
                steps: stateBuilder
                    ?.split("-")
                    .map((k) => _formSteps.find((fs) => fs.prodUid == k)),
                key: stateBuilder,
            });
        }
    });
    return states;
}

export function getDepsUid(stepIndex, formStepArray, stepForm) {
    const dependecies = getFormSteps(formStepArray, stepIndex).filter(
        (_, i) => stepForm.step.meta?.priceDepencies?.[_.uid]
    );
    const uids = dependecies.map((s) => s.prodUid);
    return uids.length ? uids.join("-") : null;
}
