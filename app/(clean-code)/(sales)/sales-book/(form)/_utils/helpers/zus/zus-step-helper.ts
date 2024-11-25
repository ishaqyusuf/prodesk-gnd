import { getStepComponentsUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { zhItemUidFromStepUid } from "./zus-form-helper";

interface LoadStepComponentsProps {
    stepUid: string;
    zus: ZusSales;
}
export async function zhLoadStepComponents({
    zus,
    stepUid,
}: LoadStepComponentsProps) {
    const stepData = zus.kvStepForm?.[stepUid];
    const [uid, _stepUid] = stepUid?.split("-");
    const stepComponents = zus.kvFilteredStepComponentList[stepUid];
    if (!stepComponents) {
        const components = await getStepComponentsUseCase(
            stepData.title,
            stepData.stepId
        );

        const data = {
            ...zus.kvFilteredStepComponentList,
            [stepUid]: components,
        };
        zus.update("kvFilteredStepComponentList", data);
    }
    console.log("LOAED>>", stepUid);
}
export async function zhSelectStepComponent({
    zus,
    stepUid,
    id,
}: LoadStepComponentsProps & {
    id: number;
}) {
    const component = zus.kvFilteredStepComponentList[stepUid]?.find(
        (c) => c.id == id
    );
    const itemUid = zhItemUidFromStepUid(stepUid);
    const data = zus.kvStepForm[stepUid] || {};
    data.value = component.title;
    // data.componentUid = component.uid;
    data.price = component.price;
    data.stepId = component.stepId;
    const formData = zus.kvFormItem[itemUid];
    formData.currentStepUid = null;
    zus.update("kvFormItem", {
        ...zus.kvFormItem,
        [itemUid]: formData,
    });
    zus.update("kvStepForm", {
        ...zus.kvStepForm,
        [stepUid]: data,
    });
    console.log("component selected");
}
export async function zhNextStepComponent({
    zus,
    stepUid,
}: LoadStepComponentsProps) {}
