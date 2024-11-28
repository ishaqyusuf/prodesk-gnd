import { _modal } from "@/components/common/modal/provider";
import ComponentVariantModal from "../../../_components/modals/component-visibility-modal";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { zusFilterStepComponents } from "./zus-step-helper";
import StepPricingModal from "../../../_components/modals/step-pricing-modal";

export function zhEditComponentVariant(stepUid, componentsUid) {
    _modal.openModal(
        <ComponentVariantModal
            componentsUid={componentsUid}
            stepUid={stepUid}
        />
    );
}
export function zhEditPricing(stepUid) {
    _modal.openModal(<StepPricingModal stepUid={stepUid} />);
}
export function zhClearSelection(itemStepUid, zus: ZusSales) {
    zus.dotUpdate(`kvStepForm.${itemStepUid}._stepAction`, {
        selection: {},
        selectCount: 0,
    });
}
export function zhComponentVariantUpdated(
    itemStepUid,
    componentsUid: string[],
    variation,
    zus: ZusSales
) {
    const [itemUid, stepUid] = itemStepUid.split("-");
    const stepComponents = zus.kvStepComponentList[stepUid];
    zhClearSelection(itemStepUid, zus);

    zus.dotUpdate(
        `kvStepComponentList.${stepUid}`,
        stepComponents.map((sp) => {
            if (componentsUid.includes(sp.uid)) sp.variations = variation;
            return sp;
        })
    );
    // Object.entries(zus.kvFilteredStepComponentList).map(([k, val]) => {
    //     if (k?.endsWith(stepUid)) {
    //         zus.dotUpdate(
    //             `kvFilteredStepComponentList.${k}`,
    //             zusFilterStepComponents(k, zus)
    //         );
    //     }
    // });

    // update filtered variants
}
export function zhGetStepDependables(itemStepUid, zus: ZusSales) {
    const [itemUid, stepUid] = itemStepUid?.split("-");
    const sequence = zus.sequence.stepComponent?.[itemUid];
    const index = sequence?.indexOf(itemStepUid);
    const data = {
        steps: [],
    };
    sequence
        .filter((s, i) => i < index)
        .map((s) => {
            const [_, currentStepUid] = s.split("-");
            const stepData = zus.data.salesSetting.stepsByKey?.[currentStepUid];

            if (stepData) {
                data.steps.push({
                    uid: currentStepUid,
                    title: stepData.title,
                });
            }
        });
    return data;
}
export function zhGetComponentVariantData(itemStepUid, zus: ZusSales) {
    const [itemUid, stepUid] = itemStepUid?.split("-");
    const sequence = zus.sequence.stepComponent?.[itemUid];
    const index = sequence?.indexOf(itemStepUid);
    const data: {
        steps: { uid: string; title: string }[];
        componentsByStepUid: {
            [stepUid in string]: {
                uid: string;
                title: string;
            }[];
        };
        stepsCount: number;
    } = {
        steps: [],
        componentsByStepUid: {},
        stepsCount: 0,
    };

    sequence
        .filter((s, i) => i < index)
        .map((s) => {
            const [_, currentStepUid] = s.split("-");
            const stepData = zus.data.salesSetting.stepsByKey?.[currentStepUid];

            if (stepData) {
                data.stepsCount++;
                data.steps.push({
                    uid: currentStepUid,
                    title: stepData.title,
                });
                data.componentsByStepUid[currentStepUid] =
                    stepData.components || [];
            }
        });

    return data;
}
