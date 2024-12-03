import { _modal } from "@/components/common/modal/provider";
import ComponentVariantModal from "../../../_components/modals/component-visibility-modal";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import StepPricingModal from "../../../_components/modals/step-pricing-modal";

export function zhEditPricing(stepUid) {
    _modal.openModal(<StepPricingModal stepUid={stepUid} />);
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
// export function zhGetComponentPricing(
//     component: ZusComponent,
//     zus: ZusSales,
//     itemStepUid
// ) {
//     // component.price = 100;
//     const cls = new ComponentHelperClass(
//         itemStepUid,
//         zus,
//         component.uid,
//         component
//     );
//     component.price = cls.getComponentPrice;
//     // const price = cls.getComponentPrice;
//     // cls.getStepIndex
// }
