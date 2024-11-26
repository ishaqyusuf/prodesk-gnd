import {
    getNextStepUseCase,
    getStepComponentsUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
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
    const stepData = zus.kvStepForm[stepUid] || {};
    stepData.value = component.title;
    // data.componentUid = component.uid;
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
    console.log({
        setting: zus.data.salesSetting,
        nextRoute,
        rootUid,
    });
    console.log(nextRoute);
}
// export class StepHelperClass {
//     // stepUid: string;
//     // zus: ZusSales;
//     itemUid;
//     constructor(public stepUid, public zus: ZusSales) {
//         const [itemUid] = stepUid?.split("-");
//         this.itemUid = itemUid;
//     }
//     public get isRoot() {
//         return "";
//     }
// }
