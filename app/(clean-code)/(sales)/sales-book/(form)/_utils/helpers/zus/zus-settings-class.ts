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
    public composeNextRoute(
        itemForm: ZusItemFormData,
        redirectUid,
        isRoot,
        stepUid
    ) {
        const route = this.zus.data.salesSetting.composedRouter;
        const rootUid = itemForm.routeUid;
        const nextRouteUid =
            redirectUid || route[rootUid]?.route?.[isRoot ? rootUid : stepUid];
        const nextRoute = this.zus.data.salesSetting.stepsByKey[nextRouteUid];
        const nextStepUid = `${this.itemUid}-${nextRoute?.uid}`;

        return {
            nextRoute,
            nextStepUid,
            nextStepForm: this.zus.kvStepForm[nextStepUid],
        };
    }
    public getNextRouteFromSettings(
        itemForm: ZusItemFormData,
        isRoot,
        redirectUid
    ) {
        const routeData = this.composeNextRoute(
            itemForm,
            redirectUid,
            isRoot,
            this.stepUid
        );
        if (!routeData.nextRoute) {
            const stepSequences =
                this.zus.sequence.stepComponent?.[this.itemUid];
            const stepIndex = stepSequences?.indexOf(this.itemStepUid);
            for (let i = stepIndex - 1; i > 0; i--) {
                const [_itemUid, _stepUid] = stepSequences[i]?.split("-");
                const nx = this.composeNextRoute(
                    itemForm,
                    null,
                    false,
                    _stepUid
                );
                const exists = stepSequences.includes(nx?.nextStepUid);
                if (!exists && nx?.nextRoute) return nx;
            }
        }
        return routeData;
    }
    public getRedirectableRoutes() {
        const settings = this.zus.data.salesSetting;
        const stepSequence = this.zus.sequence.stepComponent[this.itemUid]?.map(
            (s) => s.split("-")[1]
        );
        // console.log(stepSequence);
        const steps = settings.steps
            ?.filter((r) => {
                return true;
            })
            .map((step) => ({
                title: step.title,
                uid: step.uid,
            }));
        // console.log(steps);
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
    public updateComponentRedirectUid(componentUid, redirectUid) {
        const stepsByKey = this.zus.data.salesSetting.stepsByKey[this.stepUid];
        stepsByKey.components = stepsByKey.components.map((data) => {
            if (data.uid == componentUid) data.redirectUid = redirectUid;
            return data;
        });
        this.zus.dotUpdate(
            `data.salesSetting.stepsByKey.${this.stepUid}`,
            stepsByKey
        );
    }
    public getComponentFromSettingsByStepId(stepId, uid) {
        return Object.entries(this.zus.data.salesSetting.stepsByKey)
            .find(([stepUid, data]) => data.id == stepId)?.[1]
            ?.components?.find((c) => c.uid == uid);
    }
}
