import { FieldPath, FieldPathValue } from "react-hook-form";
import {
    useFormDataStore,
    ZusItemFormData,
    ZusSales,
} from "../../../_common/_stores/form-data-store";
import { dotObject } from "@/app/(clean-code)/_common/utils/utils";
import { formatMoney, toFixed } from "@/lib/use-number";
import { CostingClass } from "./costing-class";

export class SettingsClass extends CostingClass {
    constructor(
        public itemStepUid?,
        // public zus: ZusSales,
        public itemUid?,
        public stepUid?,
        public staticZus?: ZusSales
    ) {
        super();
        this.setting = this;
    }

    public salesProfiles() {
        const profiles = this.dotGet("data.data.profiles");
        return profiles.map(({ id, coefficient, defaultProfile, title }) => ({
            id,
            coefficient,
            defaultProfile,
            title,
        }));
    }

    public currentProfile() {
        return this.salesProfiles().find(
            (profile) => profile.id == this.dotGet("metaData.salesProfileId")
        );
    }
    public dotGet<K extends FieldPath<ZusSales>>(
        path: K
    ): FieldPathValue<ZusSales, K> {
        return dotObject.pick(path, this.zus);
    }

    public get zus(): ZusSales {
        return this.staticZus || useFormDataStore.getState();
    }
    public composeNextRoute(
        itemForm: ZusItemFormData,
        redirectUid,
        isRoot,
        stepUid
    ) {
        const route = this.zus.setting.composedRouter;
        const rootUid = itemForm.routeUid;
        const nextRouteUid =
            redirectUid || route[rootUid]?.route?.[isRoot ? rootUid : stepUid];
        const nextRoute = this.zus.setting.stepsByKey[nextRouteUid];
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
        const settings = this.zus.setting;
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
        const route = this.zus.setting.composedRouter;

        const fItem = this.zus.sequence?.stepComponent?.[this.itemUid];
        const componentUid = this.zus.kvStepForm[fItem[0]]?.componentUid;
        // const [_, componentUid] = fItem?.[0]?.split("-");
        const config = route[componentUid]?.config;

        return config || {};
    }
    public updateComponentRedirectUid(componentUid, redirectUid) {
        const stepsByKey = this.zus.setting.stepsByKey[this.stepUid];
        stepsByKey.components = stepsByKey.components.map((data) => {
            if (data.uid == componentUid) data.redirectUid = redirectUid;
            return data;
        });
        this.zus.dotUpdate(`setting.stepsByKey.${this.stepUid}`, stepsByKey);
    }
    public getComponentFromSettingsByStepId(stepId, uid) {
        return Object.entries(this.zus.setting.stepsByKey)
            .find(([stepUid, data]) => data.id == stepId)?.[1]
            ?.components?.find((c) => c.uid == uid);
    }
}
