import { formatMoney } from "@/lib/use-number";
import { ZusSales } from "../../../_common/_stores/form-data-store";
import { SettingsClass } from "./zus-settings-class";
import { toast } from "sonner";
import { addPercentage, dotArray, percentageValue, sum } from "@/lib/utils";
import { PricingMetaData } from "@/app/(clean-code)/(sales)/types";
import { dotObject, dotSet } from "@/app/(clean-code)/_common/utils/utils";

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
        // this.updateAllGroupedCost();
        Object.entries(this.setting.zus.kvFormItem).map(([itemUid, data]) => {
            this.updateComponentCost(itemUid, true);
        });
        // this.calculateTotalPrice();
        toast.success("Price updated");
    }
    public taxList() {
        return this.setting.dotGet("_taxForm.taxList");
    }
    public updateComponentCost(
        itemUid = this.setting.itemUid,
        forceUpdate = false
    ) {
        const data = this.setting.zus;
        const itemForm = data.kvFormItem[itemUid];

        let totalBasePrice = 0;
        Object.entries(data.kvStepForm).map(([k, stepData]) => {
            if (k.startsWith(`${itemUid}-`)) {
                totalBasePrice += stepData?.basePrice || 0;
            }
        });
        console.log(
            totalBasePrice,
            itemForm?.groupItem?.pricing?.components?.basePrice
        );
        if (
            ((totalBasePrice ||
                itemForm?.groupItem?.pricing?.components?.basePrice) &&
                itemForm?.groupItem?.pricing?.components?.basePrice !=
                    totalBasePrice) ||
            forceUpdate
        ) {
            // update component price
            let groupItem = itemForm.groupItem;
            if (!groupItem)
                groupItem = {
                    itemType: this.setting.getItemType(),
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
                const ds = dotSet(groupItem);
                // groupItem.pricing.components.basePrice = totalBasePrice;
                // groupItem.pricing.components.salesPrice =
                //     this.calculateSales(totalBasePrice);

                ds.set("pricing.components.basePrice", totalBasePrice);
                ds.set(
                    "pricing.components.salesPrice",
                    this.calculateSales(totalBasePrice)
                );
            }
            Object.entries(groupItem.form).map(([uid, formData]) => {
                formData.pricing.itemPrice.salesPrice = this.calculateSales(
                    formData.pricing.itemPrice.basePrice
                );
                formData.pricing.unitPrice = sum([
                    groupItem.pricing.components.salesPrice,
                    formData.pricing?.itemPrice?.salesPrice,
                ]);
            });
            if (this.setting.staticZus) {
                this.setting.staticZus.kvFormItem[itemUid].groupItem =
                    groupItem;
            } else {
                this.setting.zus.dotUpdate(
                    `kvFormItem.${itemUid}.groupItem`,
                    groupItem
                );
            }
            console.log(groupItem);
            this.updateGroupedCost(itemUid);
            this.calculateTotalPrice();
        }
        // this.calculateTotalPrice();
    }
    public updateGroupedCost(itemUid = this.setting.itemUid) {
        const data = this.setting.zus;
        const staticData = this.setting.staticZus;
        const itemForm = data.kvFormItem[itemUid];
        let groupItem = itemForm.groupItem;
        console.log({ groupItem });
        if (!groupItem.pricing)
            groupItem.pricing = {
                components: {
                    basePrice: 0,
                    salesPrice: 0,
                },
                total: {
                    basePrice: 0,
                    salesPrice: 0,
                },
            };
        groupItem.pricing.total = {
            basePrice: 0,
            salesPrice: 0,
        };
        Object.entries(groupItem?.form).map(([uid, formData]) => {
            console.log(formData);
            // if (!formData.pricing)
            //     formData.pricing = {
            //         addon: "",
            //     };
            const qty = sum([formData.qty.lh, formData.qty.rh]);
            if (!formData.qty?.total || (qty && qty != formData.qty?.total))
                formData.qty.total = qty;
            const priceList = [
                formData.pricing?.customPrice ||
                    sum([
                        groupItem?.pricing?.components?.salesPrice,
                        formData?.pricing?.itemPrice?.salesPrice,
                    ]),
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
        this.calculateTotalPrice();
    }
    public softCalculateTotalPrice(overrides: PricingMetaData = {}) {
        const data = this.setting.zus;
        const estimate = {
            ...data.metaData.pricing,
            ...overrides,
        };

        const taxProfile = this.currentTaxProfile();
        estimate.taxValue = percentageValue(
            estimate.taxxable,
            taxProfile.percentage
        );
        // console.log(estimate);
        const subGrandTot =
            sum([estimate.subTotal, estimate.taxValue, estimate.labour]) -
            Number(estimate.discount || 0);
        if (data.metaData.paymentMethod == "Credit Card") {
            estimate.ccc = percentageValue(subGrandTot, 3);
        } else estimate.ccc = 0;
        estimate.grandTotal = formatMoney(subGrandTot + (estimate.ccc || 0));
        if (this.setting?.staticZus)
            this.setting.staticZus.metaData.pricing = estimate;
        else this.setting.zus.dotUpdate("metaData.pricing", estimate);
    }
    public calculateTotalPrice() {
        const data = this.setting.zus;
        const estimate = {
            subTotal: 0,
            taxxable: 0,
        };
        Object.entries(data.kvFormItem).map(([itemUid, itemData]) => {
            const groupItem = itemData.groupItem;
            Object.entries(groupItem?.form || {}).map(([uid, formData]) => {
                if (!formData.selected) return;
                const isService = groupItem.type == "SERVICE";
                const price = Number(formData.pricing?.totalPrice || 0);
                const taxxable =
                    !isService || (isService && formData.meta.taxxable);
                estimate.subTotal += price;
                if (taxxable) estimate.taxxable += price;
            });
        });

        this.softCalculateTotalPrice(estimate);
    }
    public currentTaxProfile() {
        return this.setting.zus.metaData?.tax;
    }
    public taxCodeChanged() {
        const taxProfile = this.taxList().find(
            (tax) => tax.taxCode == this.setting.dotGet("metaData.tax.taxCode")
        );
        this.setting?.zus.dotUpdate("metaData.tax.taxCode", taxProfile.taxCode);
        this.setting?.zus.dotUpdate("metaData.tax.title", taxProfile.title);
        this.setting?.zus.dotUpdate(
            "metaData.tax.percentage",
            taxProfile.percentage
        );
        this.calculateTotalPrice();
    }
}
