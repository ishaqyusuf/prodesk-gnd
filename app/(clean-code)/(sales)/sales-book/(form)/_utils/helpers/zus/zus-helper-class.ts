import {
    getStepComponentsUseCase,
    saveComponentRedirectUidUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/step-component-use-case";
import {
    ZusComponent,
    ZusItemFormData,
    ZusSales,
    ZusStepFormData,
} from "../../../_common/_stores/form-data-store";
import { getPricingByUidUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-pricing-use-case";
import { _modal } from "@/components/common/modal/provider";
import DoorSizeModal from "../../../_components/modals/door-size-modal";
import { zhHarvestDoorSizes } from "./zus-form-helper";

import { FieldPath, FieldPathValue } from "react-hook-form";
import { SettingsClass } from "./zus-settings-class";
import { toast } from "sonner";
import { openDoorSizeSelectModal } from "../../../_components/modals/door-size-select-modal/open-modal";
interface Filters {
    stepUid?;
    stepTitle?;
}
export class StepHelperClass extends SettingsClass {
    stepUid: string;
    itemUid;
    constructor(public itemStepUid, public zus: ZusSales) {
        const [itemUid, stepUid] = itemStepUid?.split("-");
        super(itemStepUid, zus, itemUid, stepUid);
        this.itemUid = itemUid;
        this.stepUid = stepUid;
    }
    public isHtp() {
        return this.getStepForm().title == "House Package Tool";
    }
    public isDoor() {
        return this.getStepForm().title == "Door";
    }
    public isMoulding() {
        return this.getStepForm().title == "Moulding";
    }
    public isMultiSelect() {
        return this.isDoor() || this.isMoulding();
    }
    public getTotalSelectionsCount() {
        return this.getItemForm()?.groupItem?.itemIds?.length;
    }
    public getTotalSelectionsQty() {
        return this.getItemForm()?.groupItem?.qty?.total;
    }
    public hasSelections() {
        return this.getTotalSelectionsQty() && this.isMultiSelect();
    }
    public getStepIndex() {
        const index = this.getItemStepSequence()?.indexOf(this.itemStepUid);
        return index;
    }
    public getItemStepSequence() {
        const sequence = this.zus.sequence.stepComponent?.[this.itemUid];
        return sequence;
    }
    public getItemStepForms() {
        const sequence = this.getItemStepSequence();
        return Object.entries(this.zus.kvStepForm)
            .filter(([k, data]) => sequence.includes(k))
            .map(([k, data]) => data);
    }
    public getStepSequence() {
        return this.getItemStepSequence()
            ?.map((s) => s.split("-")?.[1])
            .filter(Boolean);
    }
    public getItemForm() {
        return this.zus.kvFormItem[this.itemUid];
    }
    public getStepForm() {
        return this.zus.kvStepForm[this.itemStepUid];
    }
    public updateStepForm(data) {
        Object.entries(data).map(([k, v]) => {
            this.zus.dotUpdate(`kvStepForm.${this.itemStepUid}.${k}` as any, v);
        });
    }
    public findStepForm(stepUid) {
        return this.zus.kvStepForm[`${this.itemUid}-${this.stepUid}`];
    }
    public getStepPriceDeps() {
        const stepForm = this.getStepForm();
        return stepForm?.meta?.priceStepDeps || [];
    }
    public stepValueUids(stepUids: string[]) {
        // const uidStacks = [];
        return stepUids
            .map((uid) => {
                return this.zus.kvStepForm[`${this.itemUid}-${uid}`]
                    ?.componentUid;
            })
            .filter(Boolean)
            .join("-");
    }
    public getComponentPricings(componentUid) {
        // if(!component)componentUid = this.
        const pricings = this.zus.data.pricing[componentUid];
        return pricings;
    }
    public getVisibleComponents() {
        // const ls = this.getStepComponents;
        // if (ls) return this.filterStepComponents(ls);
        const sets =
            this.zus.data.salesSetting?.stepsByKey?.[this.stepUid]?.components;
        if (sets?.length) {
            console.log("FILTERING SETS LENGTH");
            return this.filterStepComponents(sets as any);
        }
        console.log("NOT FOUND");
        return [];
    }
    public getComponentPrice(componentUid) {
        const priceDeps = this.getStepPriceDeps();
        const componentPricings = this.getComponentPricings(componentUid);
        const stepUids = this.stepValueUids(priceDeps);
        // if (componentPricings) {
        //     console.log({ priceDeps, componentPricings, stepUids });
        // }
        if (!priceDeps.length) {
            return componentPricings?.[componentUid]?.price || null;
        }
        return componentPricings?.[stepUids]?.price || null;
    }
    public isComponentVisible(c: ZusComponent) {
        if (c.variations?.length)
            return c.variations.some((v) => {
                const rules = v.rules;
                return rules.every(
                    ({ componentsUid, operator, stepUid: __stepUid }) => {
                        const selectedComponentUid =
                            this.zus.kvStepForm[`${this.itemUid}-${__stepUid}`]
                                ?.componentUid;

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
    }
    public get getStepComponents() {
        return this.zus.kvStepComponentList?.[this.stepUid];
    }
    public updateStepComponent(data) {
        this.zus.dotUpdate(
            `kvStepComponentList.${this.stepUid}`,
            this.getStepComponents?.map((c) => {
                if (c.uid == data.uid) return data;
                return c;
            })
        );
    }
    public updateStepComponentVariants(variations, componentUids: string[]) {
        this.zus.dotUpdate(
            `kvStepComponentList.${this.stepUid}`,
            this.getStepComponents?.map((c) => {
                if (componentUids.includes(c.uid)) c.variations = variations;

                return c;
            })
        );
    }
    public getComponentVariantData() {
        const sequence = this.getItemStepSequence();

        const index = sequence?.indexOf(this.itemStepUid);
        const data: {
            steps: { uid: string; title: string }[];
            componentsByStepUid: {
                [stepUid in string]: {
                    uid: string;
                    title: string;
                }[];
            };
            stepsCount: number;
        } = {
            steps: [],
            componentsByStepUid: {},
            stepsCount: 0,
        };
        sequence
            .filter((s, i) => i < index)
            .map((s) => {
                const [_, currentStepUid] = s.split("-");
                const stepData =
                    this.zus.data.salesSetting.stepsByKey?.[currentStepUid];

                if (stepData) {
                    data.stepsCount++;
                    data.steps.push({
                        uid: currentStepUid,
                        title: stepData.title,
                    });
                    data.componentsByStepUid[currentStepUid] =
                        stepData.components || [];
                }
            });

        return data;
    }
    public async fetchStepComponents(reload = false) {
        const stepData = this.getStepForm();
        const ls = this.getStepComponents;
        // if (ls) return ls;
        const components = ls
            ? ls
            : await getStepComponentsUseCase(stepData.title, stepData.stepId);
        if (!ls)
            this.zus.dotUpdate(
                `kvStepComponentList.${this.stepUid}`,
                components
            );
        return this.filterStepComponents(components);
    }

    public getAllVisibleComponents(filter?: Filters) {
        const itemStepsUids = this.getItemStepSequence();
        return itemStepsUids

            .map((itemStepUid) => {
                const [itemUid, stepUid] = itemStepUid.split("-");
                // const rootStep = this.rootStepFromUid(stepUid);
                const itemStepCls = new StepHelperClass(itemStepUid, this.zus);
                const components = itemStepCls.getVisibleComponents();
                const stepForm = itemStepCls.getStepForm();
                return {
                    stepTitle: stepForm.title,
                    stepUid: itemStepCls.stepUid,
                    components,
                };
            })
            .filter((a) => {
                if (filter?.stepTitle) return a.stepTitle == filter.stepTitle;
                if (filter?.stepUid) return a.stepUid == filter.stepUid;
                return true;
            })
            .map((a) => a.components)
            .flat()
            ?.filter((a) => a._metaData?.visible);
    }
    public filterStepComponents(components: ZusComponent[]) {
        const filteredComponents = components
            // ?.filter(cls.isComponentVisible)
            ?.map((component) => {
                if (!component._metaData) component._metaData = {} as any;
                component._metaData.visible =
                    this.isComponentVisible(component);
                component.price = this.getComponentPrice(component.uid);
                return component;
            });
        return filteredComponents;
    }
    public rootStepFromUid(stepUid) {
        const mainStep = Object.values(
            this.zus.data.salesSetting.rootComponentsByKey
        )?.find((s) => s.stepUid == stepUid);
        return mainStep;
    }
    public selectorState: {
        state: {
            uids: {};
            count: number;
        };
        setState: any;
    } = {
        state: null,
        setState: null,
    };
    public resetSelector(state, setState) {
        // this.selection = { count: 0, selection: {} };
        this.selectorState = {
            state,
            setState,
        };
        setState({
            uids: {},
            count: 0,
        });
        return this;
    }
    public toggleComponent(componentUid) {
        this.selectorState.setState?.((current) => {
            const state = !current.uids?.[componentUid];
            const count = current.count + state ? 1 : -1;
            const resp = {
                uids: {
                    ...current?.uids,
                    [componentUid]: state,
                },
                count,
            };
            console.log(resp);

            return resp;
        });
    }
    public saveStepForm(data: ZusStepFormData) {
        this.zus.dotUpdate(`kvStepForm.${this.itemStepUid}`, data);
    }
    public saveItemForm(data: ZusItemFormData) {
        this.zus.dotUpdate(`kvFormItem.${this.itemUid}`, data);
    }
    public dotUpdateItemForm<K extends FieldPath<ZusItemFormData>>(
        k: K,
        value: FieldPathValue<ZusItemFormData, K>
    ) {
        this.zus.dotUpdate(`kvFormItem.${this.itemUid}.${k}`, value as any);
    }
    public updateNextStepSequence(nextStepUid, stepForm) {
        const stepSq = this.getItemStepSequence();
        const prevStepIndex = stepSq.indexOf(this.itemStepUid);
        const prevNextStepUid = stepSq[prevStepIndex + 1];
        if (prevNextStepUid) {
            if (prevNextStepUid != nextStepUid) {
                stepSq.splice(
                    prevStepIndex + 1,
                    stepSq.length - prevStepIndex - 1
                );
                stepSq.push(nextStepUid);
            }
        } else {
            stepSq.push(nextStepUid);
        }
        this.zus.dotUpdate(`kvStepForm.${nextStepUid}`, stepForm);
        this.zus.dotUpdate(`sequence.stepComponent.${this.itemUid}`, stepSq);
        this.zus.toggleStep(nextStepUid);
    }
    public nextStep(isRoot = false, redirectUid = null) {
        const nrs = this.getNextRouteFromSettings(
            this.getItemForm(),
            isRoot,
            redirectUid
        );
        if (!nrs.nextRoute) {
            toast.error("This Form Step Sequence has no next step.");
            return;
        }
        let { nextStepForm, nextRoute, nextStepUid } = nrs;
        if (!nextStepForm) {
            nextStepForm = {
                componentUid: null,
                meta: nextRoute.meta,
            };
        }
        nextStepForm.title = nextRoute.title;
        nextStepForm.stepId = nextRoute.id;
        nextStepForm.value = nextStepForm.value || "";

        this.updateNextStepSequence(nextStepUid, nextStepForm);
    }
    public getDoorPriceModel(componentUid) {
        const { sizeList, height } = zhHarvestDoorSizes(this.zus, this.itemUid);
        const formData = {
            priceVariants: {} as {
                [size in string]: {
                    id?: number;
                    price?: number;
                };
            },
            stepProductUid: componentUid,
            dykeStepId: this.getStepForm().stepId,
        };
        const stepProdPricings = this.getComponentPricings(componentUid);

        sizeList.map((sl) => {
            formData.priceVariants[sl.size] = stepProdPricings[sl.size] || {
                id: null,
                price: "",
            };
        });
        return {
            formData,
            sizeList,
            height,
            heightSizeList: sizeList?.filter((s) => s.height == height),
        };
    }
    public getCurrentComponentPricingModel(componentUid) {
        const pm = this.getComponentPriceModel(componentUid);
        const variant = pm.priceVariants.find((s) => s.current);
        const pricing = pm.pricing[variant.path];
        return {
            variant,
            pricing,
        };
    }
    public getComponentPriceModel(componentUid) {
        const priceDeps = this.getStepPriceDeps();
        const stepSeqs = this.getItemStepSequence();

        const matchedSteps = priceDeps
            ?.map((dep) => {
                const [itemUid, stepUid] =
                    stepSeqs?.find((s) => s.endsWith(`-${dep}`))?.split("-") ||
                    [];
                return stepUid;
            })
            .filter(Boolean);
        // const componentUid = this.componentUid;
        const componentPricings = this.getComponentPricings(componentUid);
        const form = {
            pricing: componentPricings,
            priceVariants: [] as {
                path: string;
                title: string[];
                current?: boolean;
            }[],
        };

        if (!matchedSteps?.length) {
            form.priceVariants.push({
                path: `${componentUid}.${componentUid}`,
                title: ["Default Price"],
            });
        } else {
            // console.log(this.zus.data.salesSetting?.rootComponentsByKey);
            const ms = matchedSteps.map((stepUid) => {
                const components =
                    this.zus.data.salesSetting?.stepsByKey?.[stepUid]
                        ?.components;
                return components
                    .filter((c) => {
                        const mainStep = this.rootStepFromUid(stepUid);
                        if (mainStep) {
                            const stepSeq = this.getItemStepSequence()?.[0];
                            const rootCUid =
                                this.zus.kvStepForm[stepSeq]?.componentUid;
                            return c.uid == rootCUid;
                        }
                        return true;
                    })
                    .map((c) => ({
                        ...c,
                        stepUid,
                    }))
                    .filter(Boolean);
            });
            const combs = getCombinations(ms);
            // console.log({ ms });
            // console.log(this.getItemStepSequence());

            const visibleComponents = this.getAllVisibleComponents();
            const visibleComponentsUID = visibleComponents.map((a) => a.uid);
            const filteredCombs = combs.filter((a) => {
                return a.uidStack.every((u) =>
                    visibleComponentsUID.includes(u)
                );
            });
            const kvstepforms = this.zus.kvStepForm;
            form.priceVariants = filteredCombs?.map((fc) => {
                const path = fc.uidStack?.join("-");
                let current = fc.uidStack.every(
                    (u, i) =>
                        kvstepforms[`${this.itemUid}-${fc.stepUidStack[i]}`]
                            ?.componentUid == u
                );

                if (!form.pricing[path])
                    form.pricing[path] = {
                        price: "",
                        id: null,
                    };
                return {
                    path,
                    title: fc.titleStack,
                    current,
                };
            });
            console.log({ filteredCombs, combs, visibleComponents });
            // console.log({
            //     currents: form.priceVariants.filter((c) => c.current),
            // });
        }
        return form;
    }
}
export class ComponentHelperClass extends StepHelperClass {
    constructor(
        itemStepUid,
        zus: ZusSales,
        public componentUid,
        public component?: ZusComponent
    ) {
        super(itemStepUid, zus);
        this.redirectUid = this.getComponent?.redirectUid;
    }
    public redirectUid;

    public get getComponent() {
        if (this.component) return this.component;
        return this.zus.kvStepComponentList[this.stepUid]?.find(
            (c) => c.uid == this.componentUid
        );
        // this.component = load component
        // return this.component;
    }

    public async fetchUpdatedPrice() {
        const priceData = await getPricingByUidUseCase(this.componentUid);
        Object.entries(priceData).map(([k, d]) =>
            this.zus.dotUpdate(`data.pricing.${k}`, d)
        );
    }
    public selectComponent() {
        const isMulti = this.isMultiSelect();

        if (this.isDoor()) {
            openDoorSizeSelectModal(this);
        } else if (this.isMoulding()) {
            let groupItem = this.getItemForm()?.groupItem;
            if (!groupItem)
                groupItem = {
                    pricing: {},
                    itemIds: [],
                    form: {},
                    stepUid: "stepProdUid",
                    qty: {
                        lh: 0,
                        rh: 0,
                        total: 0,
                    },
                };
            if (!groupItem.form?.[this.componentUid])
                groupItem.form[this.componentUid] = {
                    selected: true,
                    meta: {
                        description: this.component?.title,
                        taxxable: false,
                        produceable: false,
                    },
                    qty: {
                        rh: "",
                        lh: "",
                        total: 1,
                    },
                    addon: "",
                    swing: "",
                };
            else {
                groupItem.form[this.componentUid].selected =
                    !groupItem.form?.[this.componentUid].selected;
            }
            groupItem.itemIds = Object.entries(groupItem.form)
                .filter(([uid, data]) => data.selected)
                .map(([uid, data]) => uid);

            this.dotUpdateItemForm("groupItem", groupItem);
        } else {
            let stepData = this.getStepForm();
            const component = this.component;
            stepData = {
                ...stepData,
                componentUid: this.componentUid,
                value: component.title,
                stepId: component.stepId,
                price: component.price,
            };
            this.saveStepForm(stepData);
            this.dotUpdateItemForm("currentStepUid", null);
            const isRoot = this.componentIsRoot();
            if (isRoot) {
                this.dotUpdateItemForm("routeUid", this.componentUid);
            }
            this.nextStep(isRoot, this.redirectUid);
        }
    }
    public componentIsRoot() {
        const route = this.zus.data.salesSetting.composedRouter;
        const isRoot = route[this.componentUid] != null;
        return isRoot;
    }
    public getMultiSelectData() {
        return Object.entries(this.getItemForm()?.groupItem?.form || {})
            ?.filter(([uid, data]) => uid?.startsWith(`${this.componentUid}-`))
            .map(([uid, data]) => data);
    }
    public multiSelected() {
        return this.getMultiSelectData().length > 0;
    }
    public async saveComponentRedirect(redirectUid) {
        await saveComponentRedirectUidUseCase(this.component.id, redirectUid);
        toast.success("Saved");
        this.updateStepComponent({
            ...this.component,
            redirectUid,
        });
    }
}

function getCombinations(
    arr: { title: string; uid: string; stepUid: string }[][]
) {
    // : { titleStack: string[]; uidStack: string[] }[]
    const result: {
        titleStack: string[];
        uidStack: string[];
        stepUidStack: string[];
    }[] = [];

    function backtrack(
        titleStack: string[],
        uidStack: string[],
        stepUidStack: string[],
        index: number
    ) {
        if (index === arr.length) {
            result.push({
                titleStack: [...titleStack],
                uidStack: [...uidStack],
                stepUidStack: [...stepUidStack],
            });
            return;
        }
        for (const item of arr[index]) {
            titleStack.push(item.title);
            uidStack.push(item.uid);
            stepUidStack.push(item.stepUid);
            backtrack(titleStack, uidStack, stepUidStack, index + 1);
            titleStack.pop();
            uidStack.pop();
            stepUidStack.pop();
        }
    }

    backtrack([], [], [], 0);
    return result;
}
