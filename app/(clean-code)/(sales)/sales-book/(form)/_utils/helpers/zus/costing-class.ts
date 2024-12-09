import { formatMoney } from "@/lib/use-number";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { SettingsClass } from "./zus-settings-class";
import { toast } from "sonner";
import { sum } from "@/lib/utils";

export class CostingClass {
    constructor(public setting?: SettingsClass) {}
    public get salesMultiplier() {
        return this.setting.dotGet("metaData.salesMultiplier") || 1;
    }
    public calculateSales(price) {
        if (!price) return price;
        const value = formatMoney(price * this.salesMultiplier);
        return value;
    }
    public calculateCost(sales) {
        return formatMoney(sales / this.salesMultiplier);
    }
    public salesProfileChanged() {
        const profile = this.setting.currentProfile();
        const multiplier = profile.coefficient
            ? formatMoney(1 / profile.coefficient)
            : 1;
        this.setting.zus.dotUpdate("metaData.salesMultiplier", multiplier);
        toast.success("Price updated");
    }
    public taxList() {
        return this.setting.dotGet("data._taxForm.taxList");
    }
    public updateComponentCost() {
        const data = this.setting.zus;
        const itemForm = data.kvFormItem[this.setting.itemUid];
        let totalBasePrice = 0;
        Object.entries(data.kvStepForm).map(([k, stepData]) => {
            if (k.startsWith(`${this.setting.itemUid}-`)) {
                totalBasePrice += stepData?.basePrice || 0;
            }
        });
        console.log(
            totalBasePrice,
            itemForm?.groupItem?.pricing?.components?.basePrice
        );
        if (
            (totalBasePrice ||
                itemForm?.groupItem?.pricing?.components?.basePrice) &&
            itemForm?.groupItem?.pricing?.components?.basePrice !=
                totalBasePrice
        ) {
            // update component price
            let groupItem = itemForm.groupItem;
            if (!groupItem)
                groupItem = {
                    form: {},
                    itemIds: [],
                    qty: {},
                    pricing: {
                        components: {
                            basePrice: totalBasePrice,
                            salesPrice: this.calculateSales(totalBasePrice),
                        },
                        total: {},
                    },
                };
            else {
                groupItem.pricing.components.basePrice = totalBasePrice;
                groupItem.pricing.components.salesPrice =
                    this.calculateSales(totalBasePrice);
            }
            Object.entries(groupItem.form).map(([uid, formData]) => {
                formData.pricing.estimatedComponentPrice = sum([
                    groupItem.pricing.components.salesPrice,
                    formData.pricing?.itemPrice?.salesPrice,
                ]);
            });
            if (this.setting.staticZus) {
                this.setting.staticZus.kvFormItem[
                    this.setting.itemUid
                ].groupItem = groupItem;
            } else {
                this.setting.zus.dotUpdate(
                    `kvFormItem.${this.setting.itemUid}.groupItem`,
                    groupItem
                );
            }
            console.log(groupItem);
            this.updateGroupedCost();
        }
        // this.calculateTotalPrice();
    }
    public updateGroupedCost(itemUid = this.setting.itemUid) {
        const data = this.setting.zus;
        const staticData = this.setting.staticZus;
        const itemForm = data.kvFormItem[itemUid];
        const groupItem = itemForm.groupItem;
        groupItem.pricing.total = {
            basePrice: 0,
            salesPrice: 0,
        };
        Object.entries(groupItem?.form).map(([uid, formData]) => {
            const qty = sum([formData.qty.lh, formData.qty.rh]);
            if (!formData.qty?.total || (qty && qty != formData.qty?.total))
                formData.qty.total = qty;
            const priceList = [
                formData.pricing?.customPrice ||
                    formData.pricing?.estimatedComponentPrice,
                // groupItem?.pricing?.components?.salesPrice,
                formData.pricing?.addon,
            ];
            const unitPrice = sum(priceList);
            const total = formatMoney(
                sum(priceList) * Number(formData.qty.total)
            );
            formData.pricing.unitPrice = unitPrice;
            formData.pricing.totalPrice = total;
            console.log({ total, priceList });
            if (formData.selected) groupItem.pricing.total.salesPrice += total;
        });
        if (!staticData)
            this.setting.zus.dotUpdate(
                `kvFormItem.${itemUid}.groupItem`,
                groupItem
            );
        else staticData.kvFormItem[itemUid].groupItem = groupItem;
        console.log(groupItem);
    }
    public updateAllGroupedCost() {
        const data = this.setting.zus;
        Object.entries(data.kvFormItem).map(([itemUid, itemData]) => {
            this.updateGroupedCost(itemUid);
        });
    }
    public calculateTotalPrice() {
        const taxProfile = this.currentTaxProfile();
        const data = this.setting.zus;
        Object.entries(data.kvFormItem).map(([itemUid, itemData]) => {});
    }
    public currentTaxProfile() {
        return this.taxList().find(
            (tax) =>
                tax.taxCode == this.setting.dotGet("metaData.pricing.taxCode")
        );
    }
    public taxCodeChanged() {
        const taxProfile = this.currentTaxProfile();
        // console.log(taxProfile);
        this.calculateTotalPrice();
    }
}
