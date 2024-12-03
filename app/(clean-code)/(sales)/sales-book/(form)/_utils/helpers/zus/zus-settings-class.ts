import {
    ZusItemFormData,
    ZusSales,
} from "../../../_common/_stores/form-data-store";

export class SettingsClass {
    constructor(
        public itemStepUid,
        public zus: ZusSales,
        public itemUid,
        public stepUid
    ) {}

    public getNextRouteFromSettings(itemForm: ZusItemFormData, isRoot) {
        const route = this.zus.data.salesSetting.composedRouter;
        const rootUid = itemForm.routeUid;
        const nextRouteUid =
            route[rootUid]?.route?.[isRoot ? rootUid : this.stepUid];
        const nextRoute = this.zus.data.salesSetting.stepsByKey[nextRouteUid];
        const nextStepUid = `${this.itemUid}-${nextRoute?.uid}`;
        return {
            nextRoute,
            nextStepUid,
            nextStepForm: this.zus.kvStepForm[nextStepUid],
        };
    }
    public getRedirectableRoutes() {
        const settings = this.zus.data.salesSetting;
        const stepSequence = this.zus.sequence.stepComponent[this.itemUid]?.map(
            (s) => s.split("-")[1]
        );
        console.log(stepSequence);
        const steps = settings.steps
            ?.filter((r) => {
                return true;
            })
            .map((step) => ({
                title: step.title,
                uid: step.uid,
            }));
        console.log(steps);
        return steps;
    }
    public getRouteConfig() {
        const route = this.zus.data.salesSetting.composedRouter;

        const fItem = this.zus.sequence?.stepComponent?.[this.itemUid];
        const componentUid = this.zus.kvStepForm[fItem[0]]?.componentUid;
        // const [_, componentUid] = fItem?.[0]?.split("-");
        const config = route[componentUid]?.config;

        return config || {};
    }
}
