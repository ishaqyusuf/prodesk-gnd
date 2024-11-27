import { _modal } from "@/components/common/modal/provider";
import ComponentVariantModal from "../../../_components/modals/component-visibility-modal";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { zusFilterStepComponents } from "./zus-step-helper";

export function zhEditComponentVariant(stepUid, componentUid) {
    _modal.openModal(
        <ComponentVariantModal stepUid={stepUid} componentUid={componentUid} />
    );
}
export function zhComponentVariantUpdated(
    itemStepUid,
    componentUid,
    variation,
    zus: ZusSales
) {
    const [itemUid, stepUid] = itemStepUid.split("-");
    const stepComponents = zus.kvStepComponentList[stepUid];
    zus.dotUpdate(
        `kvStepComponentList.${stepUid}`,
        stepComponents.map((sp) => {
            if (sp.uid == componentUid) sp.variations = variation;
            return sp;
        })
    );
    zusFilterStepComponents(itemStepUid, zus);
    // update filtered variants
}
export function zhGetComponentVariantData(
    itemStepUid,
    componentUid,
    zus: ZusSales
) {
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
