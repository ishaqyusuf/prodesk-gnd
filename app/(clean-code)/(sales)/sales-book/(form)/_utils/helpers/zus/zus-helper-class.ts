import {
    ZusComponent,
    ZusSales,
} from "../../../_common/_stores/form-data-store";

export class StepHelperClass {
    stepUid: string;
    itemUid;
    constructor(public itemStepUid, public zus: ZusSales) {
        const [itemUid, stepUid] = itemStepUid?.split("-");
        this.itemUid = itemUid;
        this.stepUid = stepUid;
    }
    public get getStepIndex() {
        const sequence = this.zus.sequence.stepComponent?.[this.itemUid];
        const index = sequence?.indexOf(this.itemStepUid);
        return index;
    }
    public get getStepForm() {
        return this.zus.kvStepForm[this.itemStepUid];
    }
    public get getStepPriceDeps() {
        const stepForm = this.getStepForm;
        return stepForm?.meta?.stepPricingDeps || [];
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
        const pricings = this.zus.data.pricing[componentUid];
        return pricings;
    }
    public getComponentPrice(componentUid) {
        const priceDeps = this.getStepPriceDeps;
        const componentPricings = this.getComponentPricings(componentUid);
        const stepUids = this.stepValueUids(priceDeps);
        if (componentPricings) {
            console.log({ priceDeps, componentPricings, stepUids });
        }
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
}
export class ComponentHelperClass extends StepHelperClass {
    constructor(
        itemStepUid,
        zus: ZusSales,
        public componentUid,
        public component?: ZusComponent
    ) {
        super(itemStepUid, zus);
    }
    public get getComponent() {
        if (this.component) return this.component;
        // this.component = load component
        return this.component;
    }
    // public get getComponentPricings() {
    //     const pricings = this.zus.data.pricing[this.componentUid];
    //     return pricings;
    // }
    // public get getComponentPrice() {
    //     const priceDeps = this.getStepPriceDeps;

    //     const componentPricings = this.getComponentPricings;
    //     const stepUids = this.stepValueUids(priceDeps);
    //     if (componentPricings) {
    //         console.log({ priceDeps, componentPricings, stepUids });
    //     }
    //     if (!priceDeps.length) {
    //         return componentPricings?.[this.componentUid]?.price || null;
    //     }
    //     return componentPricings?.[stepUids]?.price || null;
    // }
}
