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
}
