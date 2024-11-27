import {
    deleteStepComponentsUseCase,
    getNextStepUseCase,
    getStepComponentsUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { zhItemUidFromStepUid } from "./zus-form-helper";
import { toast } from "sonner";

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
    const stepComponents = zus.kvStepComponentList[_stepUid];

    if (!stepComponents) {
        const components = await getStepComponentsUseCase(
            stepData.title,
            stepData.stepId
        );
        console.log({
            components,
        });
        // const data = {
        //     ...zus.kvFilteredStepComponentList,
        //     [stepUid]: components,
        // };
        zus.dotUpdate(`kvStepComponentList.${_stepUid}`, components);
        // zus.update("kvFilteredStepComponentList", data);
        zusFilterStepComponents(stepUid, zus);
    }
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
    setTimeout(async () => {
        await zhNextStepComponent({
            zus,
            stepUid,
            isRoot: isRoot != null,
        });
    }, 200);
}
export async function zhNextStepComponent({
    zus,
    stepUid,
    isRoot,
}: LoadStepComponentsProps & { isRoot }) {
    const nextRoute = zhNextRoute({ zus, stepUid, isRoot });
    // const resp = await getNextStepUseCase({
    //     nextStepId,
    // });
    // console.log(resp);
}
export function getRoute({
    zus,
    componentUid,
    stepUid,
}: {
    zus: ZusSales;
    componentUid?;
    stepUid;
}) {}
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
    const rootUid = itemForm.routeUid;
    const nextRouteUid =
        route[rootUid].route?.[isRoot ? rootUid : componentStepUid];
    const nextRoute = zus.data.salesSetting.stepsByKey[nextRouteUid];
    const nextStepUid = `${itemUid}-${nextRoute.uid}`;
    let stepForm = zus.kvStepForm[nextStepUid] || {
        componentUid: null,
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
    if (prevNextStepUid && prevNextStepUid != nextStepUid) {
        stepSq.splice(prevStepIndex + 2);
    }
    if (prevNextStepUid != nextStepUid) stepSq.push(nextStepUid);
    zus.dotUpdate(`kvStepForm.${nextStepUid}`, stepForm);
    zus.dotUpdate(`sequence.stepComponent.${itemUid}`, stepSq);
    console.log({ stepForm, stepSq });

    zus.toggleStep(nextStepUid);
}
export function zusFilterStepComponents(itemStepUid, zus: ZusSales) {
    const [uid, stepUid] = itemStepUid?.split("-");
    const stepComponents = zus.kvStepComponentList[stepUid].filter((c) => {
        if (c.variations?.length)
            return c.variations.some((v) => {
                const rules = v.rules;
                return rules.every(
                    ({ componentsUid, operator, stepUid: __stepUid }) => {
                        const selectedComponentUid =
                            zus.kvStepForm[`${uid}-stepUid`]?.componentUid;
                        return (
                            !componentsUid?.length ||
                            (operator == "is"
                                ? componentsUid?.some(
                                      (a) => a == selectedComponentUid
                                  )
                                : componentsUid?.every(
                                      (a) => a != selectedComponentUid
                                  ))
                        );
                    }
                );
            });
        return true;
    });
    // TODO: FILTER STEP, ADD PRICE, SET VISIBILITY ETC.
    zus.dotUpdate(`kvFilteredStepComponentList.${itemStepUid}`, stepComponents);
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
export class StepHelperClass {
    // stepUid: string;
    // zus: ZusSales;
    itemUid;
    constructor(public stepUid, public zus: ZusSales) {
        const [itemUid] = stepUid?.split("-");
        this.itemUid = itemUid;
    }
    public get isRoot() {
        return "";
    }
}
