import { ZusSales } from "../../../_common/_stores/form-data-store";

import { GroupFormClass } from "./group-form-class";
type SizeForm = ReturnType<
    HptClass["getHptForm"]
>["doors"][number]["sizeList"][number];
export class HptClass extends GroupFormClass {
    constructor(public itemStepUid, public zus: ZusSales) {
        super(itemStepUid, zus);
    }
    public getDoorStepForm() {
        console.log(this.zus.kvStepForm);

        return Object.entries(this.zus.kvStepForm).filter(
            ([uid, data]) =>
                uid.startsWith(`${this.itemUid}-`) && data.title == "Door"
        )?.[0]?.[1];
    }
    public tabChanged(value) {
        this.dotUpdateItemForm("groupItem._.tabUid", value);
    }
    public getHptForm() {
        const doors = this.getSelectedDoors();
        const config = this.getRouteConfig();
        const itemForm = this.getItemForm();

        const resp = {
            doors: doors.map((door) => {
                const priceModel = this.getDoorPriceModel(door.uid);
                console.log({ priceModel });
                return {
                    ...door,
                    sizeList: priceModel.heightSizeList?.map((hsl) => {
                        const path = `${door.uid}-${hsl.size}`;
                        return {
                            path,
                            title: hsl.size,
                            basePrice:
                                priceModel.formData?.priceVariants?.[path],
                            selected: this.isDoorSelected(path),
                        };
                    }),
                };
            }),
            config,
            pricedSteps: this.getPricedSteps(),
            tabUid: itemForm.groupItem?._?.tabUid,
        };

        if (resp.doors.every((s) => s.uid != resp.tabUid)) {
            resp.tabUid = resp.doors?.[0]?.uid;
            this.dotUpdateItemForm("groupItem._.tabUid", resp.tabUid);
        }
        return resp;
    }

    public getSelectedDoors() {
        console.log("GETTING SELECTED DOORS");
        const itemForm = this.getItemForm();
        const doorStep = this.getDoorStepForm();

        const selectionComponentUids = Array.from(
            new Set(itemForm.groupItem?.itemIds?.map((s) => s.split("-")[0]))
        );
        return selectionComponentUids.map((componentUid) => {
            const component = this.getComponentFromSettingsByStepId(
                doorStep?.stepId,
                componentUid
            );
            return component;
        });
    }
    public isDoorSelected(uid) {
        return this.getItemForm()?.groupItem?.form?.[uid]?.selected;
    }

    public addHeight(size: SizeForm) {
        const path = size.path;
        if (this.getGroupItemForm(path)) {
            this.dotUpdateGroupItemFormPath(path, "selected", true);
            this.dotUpdateGroupItemFormPath(path, "qty.lh", "");
            this.dotUpdateGroupItemFormPath(path, "qty.rh", "");
            this.dotUpdateGroupItemFormPath(path, "qty.total", "");
        } else {
            this.dotUpdateGroupItemForm(path, {
                qty: {
                    lh: "",
                    rh: "",
                    total: "",
                },
                selected: true,
                swing: "",
                addon: "",
                meta: {
                    description: "",
                    produceable: true,
                    taxxable: true,
                },
            });
        }
    }
}
