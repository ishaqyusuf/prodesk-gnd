import {
    deleteStepComponentsUseCase,
    getStepComponentsUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { zhItemUidFromStepUid } from "./zus-form-helper";
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
export async function zhSelectStepComponent({
    zus,
    stepUid,
    id,
    component,
}: LoadStepComponentsProps & {
    id: number;
    component;
}) {
    const itemUid = zhItemUidFromStepUid(stepUid);
    let stepData = zus.kvStepForm[stepUid];
    stepData.componentUid = component.uid;
    stepData.value = component.title;
    stepData.price = component.price;
    stepData.stepId = component.stepId;

    const route = zus.data.salesSetting.composedRouter;
    const isRoot = route[component.uid];

    const formData = zus.kvFormItem[itemUid];
    formData.currentStepUid = null;
    if (isRoot) formData.routeUid = component.uid;
    zus.update("kvFormItem", {
        ...zus.kvFormItem,
        [itemUid]: formData,
    });
    zus.update("kvStepForm", {
        ...zus.kvStepForm,
        [stepUid]: stepData,
    });
    setTimeout(() => {
        zus.dotUpdate(`kvFilteredStepComponentList.${stepUid}`, null);
        console.log("filtered cleared", stepUid);

        zhNextRoute({
            zus,
            stepUid,
            isRoot: isRoot != null,
        });
    }, 200);
}
export function componentIsRoot({
    zus,
    componentUid,
}: {
    componentUid;
    zus: ZusSales;
}) {
    const route = zus.data.salesSetting.composedRouter;
}
export function zhNextRoute({
    zus,
    stepUid,
    isRoot,
}: LoadStepComponentsProps & { isRoot }) {
    const route = zus.data.salesSetting.composedRouter;
    const [itemUid, componentStepUid] = stepUid?.split("-");
    const itemForm = zus.kvFormItem[itemUid];
    // zus.sequence
    const rootUid = itemForm.routeUid;
    const nextRouteUid =
        route[rootUid]?.route?.[isRoot ? rootUid : componentStepUid];
    const nextRoute = zus.data.salesSetting.stepsByKey[nextRouteUid];

    if (!nextRoute) {
        toast.error("This Form Step Sequence has no next step.");
        return;
    }
    const nextStepUid = `${itemUid}-${nextRoute.uid}`;
    let stepForm = zus.kvStepForm[nextStepUid];
    if (!stepForm)
        stepForm = {
            componentUid: null,
            meta: nextRoute.meta,
        };
    stepForm.title = nextRoute.title;
    stepForm.stepId = nextRoute.id;
    stepForm.value = stepForm.value || "";
    stepForm._stepAction = {
        selection: {},
        selectionCount: 0,
    };
    const stepSq = zus.sequence.stepComponent[itemUid];
    const prevStepIndex = stepSq.indexOf(stepUid);
    const prevNextStepUid = stepSq[prevStepIndex + 1];
    if (prevNextStepUid) {
        if (prevNextStepUid != nextStepUid) {
            stepSq.splice(prevStepIndex + 1, stepSq.length - prevStepIndex - 1);
            stepSq.push(nextStepUid);
        } else {
            // console.log("MATCHED NEXT STEP");
        }
        // if (prevNextStepUid != nextStepUid)
    } else {
        // console.log("FRESH NEXT STEP");
        stepSq.push(nextStepUid);
    }
    console.log({ prevStepIndex, nextStepUid, stepSq });

    zus.dotUpdate(`kvStepForm.${nextStepUid}`, stepForm);
    zus.dotUpdate(`sequence.stepComponent.${itemUid}`, stepSq);
    zus.toggleStep(nextStepUid);
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
    const filterComponents = zus.kvFilteredStepComponentList[stepUid];
    zus.dotUpdate(
        `kvFilteredStepComponentList.${stepUid}`,
        filterComponents?.filter((c) => uids.every((u) => u != c.uid))
    );
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
