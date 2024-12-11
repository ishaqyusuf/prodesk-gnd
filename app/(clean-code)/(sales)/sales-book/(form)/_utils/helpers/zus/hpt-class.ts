import { formatMoney } from "@/lib/use-number";
import { ZusSales } from "../../../_common/_stores/form-data-store";

import { GroupFormClass } from "./group-form-class";
type SizeForm = ReturnType<
    HptClass["getHptForm"]
>["doors"][number]["sizeList"][number];
export class HptClass extends GroupFormClass {
    constructor(public itemStepUid) {
        super(itemStepUid);
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
        console.log({ doors });

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
                        const selected = this.isDoorSelected(path);
                        console.log({ path, selected });
                        return {
                            path,
                            title: hsl.size,
                            basePrice:
                                priceModel.formData?.priceVariants?.[path],
                            selected,
                        };
                    }),
                };
            }),
            config,
            pricedSteps: this.getPricedSteps(),
            // tabUid: itemForm.groupItem?._?.tabUid,
        };

        // if (resp.doors.every((s) => s.uid != resp.tabUid)) {
        //     resp.tabUid = resp.doors?.[0]?.uid;
        //     this.dotUpdateItemForm("groupItem._.tabUid", resp.tabUid);
        // }
        console.log(resp.doors);
        return resp;
    }
    public getStepProductUid() {
        return this.getItemForm()?.groupItem?.doorStepProductId;
    }
    public get tabUid() {
        return this.getItemForm()?.groupItem?._?.tabUid;
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
    public getComponentPrice() {
        const itemForm = this.getItemForm();
        return itemForm?.groupItem?.pricing?.components?.salesPrice;
    }

    public addHeight(size: SizeForm) {
        const path = size.path;
        if (this.getGroupItemForm(path)) {
            this.dotUpdateGroupItemFormPath(path, "selected", true);
            this.dotUpdateGroupItemFormPath(path, "qty.lh", "");
            this.dotUpdateGroupItemFormPath(path, "qty.rh", "");
            this.dotUpdateGroupItemFormPath(path, "qty.total", "");
        } else {
            const componentPrice = this.getComponentPrice();
            const salesPrice = this.calculateSales(size.basePrice?.price);
            const estimatedComponentPrice = formatMoney(
                salesPrice + componentPrice
            );
            this.dotUpdateGroupItemForm(path, {
                qty: {
                    lh: "",
                    rh: "",
                    total: "",
                },
                selected: true,
                swing: "",
                stepProductId: this.getStepProductUid(),
                pricing: {
                    addon: "",
                    itemPrice: {
                        basePrice: size.basePrice?.price,
                        salesPrice,
                    },
                    customPrice: "",
                    componentPrice,
                    totalPrice: 0,
                    unitPrice: formatMoney(estimatedComponentPrice),
                },
                meta: {
                    description: "",
                    produceable: true,
                    taxxable: true,
                },
            });
        }
    }
}
