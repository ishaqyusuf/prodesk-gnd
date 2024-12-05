import { deleteStepComponentsUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { toast } from "sonner";
import { StepHelperClass } from "./zus-helper-class";

interface LoadStepComponentsProps {
    stepUid: string;
    zus: ZusSales;
}
export async function zhLoadStepComponents({
    zus,
    stepUid,
}: LoadStepComponentsProps) {
    // console.log("LOADING STEP COMPONENTS");
    const cls = new StepHelperClass(stepUid);
    return await cls.fetchStepComponents();
}

export function zusFilterStepComponents(itemStepUid, zus: ZusSales) {
    const [uid, stepUid] = itemStepUid?.split("-");
    const cls = new StepHelperClass(itemStepUid);
    const filteredComponents = zus.kvStepComponentList[stepUid]
        // ?.filter(cls.isComponentVisible)
        ?.map((component) => {
            component._metaData.visible = cls.isComponentVisible(component);
            component.price = cls.getComponentPrice(component.uid);

            return component;
        });
    // TODO: FILTER STEP, ADD PRICE, SET VISIBILITY ETC.

    // console.log(`FILTERED`,)
    // zus.dotUpdate(
    //     `kvFilteredStepComponentList.${itemStepUid}`,
    //     filteredComponents
    // );
    return filteredComponents;
}

export async function zusDeleteComponents({
    stepUid,
    zus,
    productUid,
    selection,
}: LoadStepComponentsProps & { productUid: string[]; selection?: boolean }) {
    let uids = productUid?.filter(Boolean);
    const [uid, _stepUid] = stepUid?.split("-");

    if (uids.length) {
        await deleteStepComponentsUseCase(uids);
        toast.message("Deleted.");
    }
    const stepComponents = zus.kvStepComponentList[_stepUid];
    zus.dotUpdate(
        `kvStepComponentList.${_stepUid}`,
        stepComponents?.filter((c) => uids.every((u) => u != c.uid))
    );
}
export function zhtoggleStep(stepUid, zus: ZusSales) {
    const [itemUid] = stepUid?.split("-");
    const currentStepUid = zus.kvFormItem[itemUid]?.currentStepUid;
    zus.toggleStep(stepUid);
    const cleareUid = currentStepUid == stepUid ? stepUid : currentStepUid;
    if (cleareUid) {
        setTimeout(() => {
            zus.dotUpdate(`kvFilteredStepComponentList.${stepUid}`, null);
            console.log("filtered cleared", stepUid);
        }, 200);
    }
}
