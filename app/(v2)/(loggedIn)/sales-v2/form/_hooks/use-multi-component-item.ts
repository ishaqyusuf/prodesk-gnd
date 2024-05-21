import { useContext, useEffect, useState } from "react";
import { DykeItemFormContext, useDykeForm } from "./form-context";
import { camel, math, sum } from "@/lib/utils";
import { SizeForm } from "../components/modals/select-door-heights";
import { isComponentType } from "../../overview/is-component-type";
import useMultiDykeForm from "./use-multi-generator";
import getDoorConfig from "./use-door-config";
import useFooterEstimate from "./use-footer-estimate";

export type UseMultiComponentItem = ReturnType<typeof useMultiComponentItem>;
export type UseMultiComponentSizeRow = ReturnType<
    typeof useMultiComponentSizeRow
>;
export function useMultiComponentItem(componentTitle) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const rootKey = `itemArray.${item.rowIndex}.multiComponent.components.${componentTitle}`;
    const doorType = item.get.doorType();
    const isComponent = isComponentType(doorType);

    const isBifold = doorType == "Bifold";
    const isSlab = doorType == "Door Slabs Only";

    const prices = (
        isBifold || isSlab ? ["Door"] : ["Door", "Jamb Size", "Casing"]
    ).map((title) => ({
        title,
        key: camel(`${title} price`),
    }));

    const [qty, unitPrice, totalPrice, doorTotalPrice, uid, tax] = form.watch([
        `${rootKey}.qty`,
        `${rootKey}.unitPrice`,
        `${rootKey}.totalPrice`,
        `${rootKey}.doorTotalPrice`,
        `${rootKey}.uid`,
        `${rootKey}.tax`,
    ] as any);
    const footerEstimate = useFooterEstimate();
    useEffect(() => {
        const _totalPrice = math.multiply(qty, unitPrice);
        form.setValue(`${rootKey}.totalPrice` as any, _totalPrice);
        const c = form.getValues(
            `itemArray.${item.rowIndex}.multiComponent.components`
        );
        let taxxable = 0;
        let total = 0;
        Object.entries(c).map(([title, data]) => {
            const p =
                componentTitle == title ? _totalPrice : data.totalPrice || 0;
            taxxable += data.tax ? p : 0;
            total += p;
        });
        form.setValue(`itemArray.${item.rowIndex}.sectionPrice`, total);
        footerEstimate.updateFooterPrice(uid, {
            price: _totalPrice,
            doorType: item.get.doorType(),
            tax,
        });
        // updateFooterPrice(total, taxxable);
    }, [qty, unitPrice, tax]);
    function calculateLineItem() {}

    const [sizeList, setSizeList] = useState<{ dim: string; width: string }[]>(
        []
    );
    function _setSizeList(heights: SizeForm) {
        const ls = Object.values(heights || {})
            .filter((i) => i.checked)
            ?.map((s) => {
                s.dim = s.dim?.replaceAll('"', "in");
                return s;
            }) as any;
        setSizeList(ls);
        setTimeout(() => {
            calculateSizeEstimate();
        }, 1500);
    }
    function initializeSizes() {
        const itemArray = item.get.itemArray();
        const current = itemArray.multiComponent.components?.[componentTitle];
        // console.log([current, componentTitle]);
        if (current) _setSizeList(current.heights);
    }
    const keys = {
        sumQty: `${rootKey}.doorQty`,
        sumUnitPrice: `${rootKey}.unitPrice`,
        sumTotal: `${rootKey}.doorTotalPrice`,
    };
    function calculateSizeEstimate(dim?, qty?, _totalLinePrice?) {
        const itemData = item.get.itemArray();
        Object.entries(itemData.multiComponent.components).map(
            ([title, cData]) => {
                if (title == componentTitle) {
                    let totalDoors = 0;
                    let unitPrice = 0;
                    let totalPrice = 0;
                    Object.entries(cData._doorForm).map(
                        ([_size, _doorForm]) => {
                            if (!cData.heights?.[_size]?.checked) return;
                            let _qty = sum([_doorForm.lhQty, _doorForm.rhQty]);
                            let _linePrice = _doorForm.lineTotal;

                            if (_size == dim) {
                                _qty = qty;
                                _linePrice = _totalLinePrice;
                            }
                            totalDoors += _qty || 0;
                            totalPrice += _linePrice || 0;
                        }
                    );
                    form.setValue(keys.sumTotal as any, totalPrice);
                    form.setValue(keys.sumQty as any, totalDoors);
                    footerEstimate.updateFooterPrice(cData.uid, {
                        price: totalPrice,
                        tax,
                        doorType: item.get.doorType(),
                    });
                    // updateFooterPrice(totalPrice);
                }
            }
        );
    }
    function removeLine(removeTab) {
        removeTab(componentTitle);
        form.setValue(rootKey as any, null);
    }

    const doorConfig = getDoorConfig(doorType);
    return {
        doorConfig,
        initializeSizes,
        removeLine,
        calculateSizeEstimate,
        componentTitle,
        form,
        item,
        prices,
        isBifold,
        isSlab,
        sizeList,
        qty,
        rootKey,
        isComponent,
        doorType,
        unitPrice,
        totalPrice,
        doorTotalPrice,
        _setSizeList,
    };
}

export function useMultiComponentSizeRow(
    componentItem: UseMultiComponentItem,
    size: { dim; width }
) {
    const { form, rootKey, prices, item } = componentItem;
    const sizeRootKey = `${rootKey}._doorForm.${size.dim}`;

    const keys = {
        lhQty: `${sizeRootKey}.lhQty`,
        rhQty: `${sizeRootKey}.rhQty`,
        unitPrice: `${sizeRootKey}.unitPrice`,
        lineTotal: `${sizeRootKey}.lineTotal`,
        doorPrice: `${sizeRootKey}.doorPrice`,
        jambSizePrice: `${sizeRootKey}.jambSizePrice`,
        swing: `${sizeRootKey}.swing`,
        casingPrice: `${sizeRootKey}.casingPrice`,
    };
    // prices.map(p => keys[])
    const [
        lhQty,
        rhQty,
        doorPrice,
        jambSizePrice,
        casingPrice,
        lineTotal,
        unitPrice,
    ] = form.watch([
        keys.lhQty,
        keys.rhQty,
        keys.doorPrice,
        keys.jambSizePrice,
        keys.casingPrice,
        keys.lineTotal,
        keys.unitPrice,
    ] as any);

    useEffect(() => {
        const qty = sum([lhQty, rhQty]);
        const _unitPrice = sum([jambSizePrice, casingPrice, doorPrice]);
        const _totalLinePrice = math.multiply(qty, _unitPrice);
        form.setValue(`${keys.unitPrice}` as any, _unitPrice);
        form.setValue(`${keys.lineTotal}` as any, _totalLinePrice);
        componentItem.calculateSizeEstimate(size.dim, qty, _totalLinePrice);
    }, [lhQty, rhQty, doorPrice, jambSizePrice, casingPrice]);
    return {
        sizeRootKey,
        keys,
        unitPrice,
        lineTotal,
    };
}
