import { FieldPath, FieldPathValue } from "react-hook-form";
import {
    ZusGroupItemForm,
    ZusGroupItemFormPath,
    ZusItemFormData,
    ZusSales,
} from "../../../_common/_stores/form-data-store";
import { StepHelperClass } from "./zus-helper-class";
import { dotArray, toDotNotation } from "@/lib/utils";
import { dotObject } from "@/app/(clean-code)/_common/utils/utils";
type SizeForm = ReturnType<
    HptClass["getHptForm"]
>["doors"][number]["sizeList"][number];
export class HptClass extends StepHelperClass {
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
    public getPricedSteps() {
        // const itemForm = this.getItemForm();
        const itemSteps = this.getItemStepForms();
        return itemSteps
            .map((step) => {
                return {
                    title: step.title,
                    price: step.price,
                    value: step.value,
                };
            })
            .filter((p) => p.price);
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
    public dotGetGroupItemForm<K extends FieldPath<ZusGroupItemFormPath>>(
        path,
        k: K
    ): FieldPathValue<ZusGroupItemFormPath, K> {
        return this.getItemForm()?.groupItem?.form?.[path]?.[k as any];
    }
    public dotUpdateGroupItemForm<K extends FieldPath<ZusGroupItemForm>>(
        path: K,
        value: FieldPathValue<ZusGroupItemForm, K>
    ) {
        this.zus.dotUpdate(
            `kvFormItem.${this.itemUid}.groupItem.form.${path}`,
            value as any
        );
    }
    public dotUpdateGroupItemFormPath<
        K extends FieldPath<ZusGroupItemFormPath>
    >(path, k: K, value: FieldPathValue<ZusGroupItemFormPath, K>) {
        this.zus.dotUpdate(
            `kvFormItem.${this.itemUid}.groupItem.form.${path}.${k}`,
            value as any
        );
    }
    public getSizeForm(path) {
        return this.getItemForm()?.groupItem?.form?.[path];
    }
    public removeHeight(path) {
        this.dotUpdateGroupItemFormPath(path, "selected", false);
    }
    public updateSizeForm(path, newData: ZusGroupItemFormPath) {
        const oldData = this.getSizeForm(path);
        const dotOldData = dotObject.dot(oldData);
        const dotNewData = dotObject.dot(newData);
        for (const [key, value] of Object.entries(dotNewData)) {
            if (dotOldData[key] !== value) {
                console.log(`updating: `, key, value, dotOldData[key]);
                this.dotUpdateGroupItemFormPath(path, key as any, value);
            }
        }
    }

    public addHeight(size: SizeForm) {
        const path = size.path;
        if (this.getSizeForm(path)) {
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
