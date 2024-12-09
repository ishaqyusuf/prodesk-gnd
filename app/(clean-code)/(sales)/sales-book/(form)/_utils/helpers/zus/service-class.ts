import { generateRandomString } from "@/lib/utils";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { GroupFormClass } from "./group-form-class";
import { StepHelperClass } from "./zus-helper-class";

export class ServiceClass extends GroupFormClass {
    constructor(public itemStepUid) {
        super(itemStepUid);
    }

    public getServiceLineForm() {
        const services = this.getServices();
        const resp = {
            lines: services.map((m) => {
                // const priceModel = this.getCurrentComponentPricingModel(m.uid);
                return {
                    ...m,
                    // basePrice: priceModel?.pricing,
                };
            }),
        };
        return resp;
    }
    public addServiceLine() {
        const uid = generateRandomString(5);
        console.log(uid);

        const itemForm = this.getItemForm();
        const itemsUids = itemForm.groupItem.itemIds;
        itemsUids.push(uid);
        this.dotUpdateItemForm("groupItem.itemIds", itemsUids);
        this.dotUpdateGroupItemForm(uid, {
            // addon: "",
            pricing: {
                addon: "",
            },
            meta: {
                description: "",
                produceable: false,
                taxxable: false,
            },
            qty: {
                total: "",
            },
            selected: true,
            swing: "",
        });
    }
    public getServices() {
        const itemForm = this.getItemForm();
        const uid = generateRandomString(5);
        let groupItem = itemForm.groupItem || {
            itemIds: [uid],
            form: {
                [uid]: {
                    addon: "",
                    meta: {
                        description: "",
                        produceable: false,
                        taxxable: false,
                    },
                    qty: {
                        total: "",
                    },
                    selected: true,
                    swing: "",
                },
            },
        };
        console.log({ groupItem });

        if (!itemForm.groupItem)
            this.dotUpdateItemForm("groupItem", groupItem as any);
        return groupItem.itemIds
            .map((itemUid) => {
                return {
                    itemUid,
                    selected: itemForm.groupItem?.form?.[itemUid]?.selected,
                };
            })
            ?.filter((s) => s.selected);
        // const gf = this.getGroupItemForm()

        // const mouldingStep = this.getMouldingStepForm();
        // const selectionComponentUids = Array.from(
        //     new Set(itemForm.groupItem?.itemIds?.map((s) => s))
        // );
        // return selectionComponentUids.map((componentUid) => {
        //     const component = this.getComponentFromSettingsByStepId(
        //         mouldingStep?.stepId,
        //         componentUid
        //     );
        //     return component;
        // });
    }
}
