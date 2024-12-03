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
    const cls = new StepHelperClass(stepUid, zus);
    return await cls.fetchStepComponents();
}

export function zusFilterStepComponents(itemStepUid, zus: ZusSales) {
    const [uid, stepUid] = itemStepUid?.split("-");
    const cls = new StepHelperClass(itemStepUid, zus);
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

export function zusToggleComponentSelect({
    stepUid,
    zus,
    productUid,
}: LoadStepComponentsProps & {
    productUid;
}) {
    const stepAction = zus.kvStepForm[stepUid]?._stepAction;
    const state = !stepAction?.selection?.[productUid];
    const currentCount = (stepAction?.selectionCount || 0) + (state ? 1 : -1);

    zus.dotUpdate(
        `kvStepForm.${stepUid}._stepAction.selection.${productUid}`,
        state
    );
    zus.dotUpdate(
        `kvStepForm.${stepUid}._stepAction.selectionCount`,
        currentCount
    );
}
export async function zusDeleteComponents({
    stepUid,
    zus,
    productUid,
    selection,
}: LoadStepComponentsProps & { productUid?: string; selection?: boolean }) {
    let uids = [productUid]?.filter(Boolean);
    const [uid, _stepUid] = stepUid?.split("-");
    let _actionForm = zus.kvStepForm[stepUid]?._stepAction;
    if (selection) {
        uids = Object.keys(_actionForm?.selection || {}).filter(
            (k) => _actionForm?.selection?.[k]
        );
    }
    if (uids.length) {
        await deleteStepComponentsUseCase(uids);
        toast.message("Deleted.");
    }
    if (selection) {
        _actionForm = {
            selection: {},
            selectionCount: 0,
        };
        zus.dotUpdate(`kvStepForm.${stepUid}._actionForm`, _actionForm);
    }
    // const filterComponents = zus.kvFilteredStepComponentList[stepUid];
    // zus.dotUpdate(
    //     `kvFilteredStepComponentList.${stepUid}`,
    //     filterComponents?.filter((c) => uids.every((u) => u != c.uid))
    // );
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
