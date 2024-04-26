import { useContext, useEffect, useState } from "react";
import { DykeItemFormContext, useDykeForm } from "./form-context";
import { camel, math, sum } from "@/lib/utils";
import { SizeForm } from "../components/modals/select-door-heights";

type UseMultiComponentItem = ReturnType<typeof useMultiComponentItem>;
export function useMultiComponentItem(componentTitle) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const rootKey = `itemArray.${item.rowIndex}.multiComponent.components.${componentTitle}`;
    const doorType = item.get.doorType();
    const isBifold = doorType == "Bifold";
    const prices = (
        doorType == "Bifold" ? ["Door"] : ["Door", "Jamb Size", "Casing"]
    ).map((title) => ({
        title,
        key: camel(`${title} price`),
    }));

    const [qty, unitPrice, totalPrice, doorTotalPrice] = form.watch([
        `${rootKey}.qty`,
        `${rootKey}.unitPrice`,
        `${rootKey}.totalPrice`,
        `${rootKey}.doorTotalPrice`,
    ] as any);
    useEffect(() => {
        form.setValue(
            `${rootKey}.totalPrice` as any,
            math.multiply(qty, unitPrice)
        );
    }, [qty, unitPrice]);
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
        console.log([current, componentTitle]);

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
                }
            }
        );
    }
    return {
        initializeSizes,
        calculateSizeEstimate,
        componentTitle,
        form,
        item,
        prices,
        isBifold,
        sizeList,
        qty,
        rootKey,
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
