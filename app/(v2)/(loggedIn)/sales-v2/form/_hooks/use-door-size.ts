import { UseFormReturn } from "react-hook-form";
import { DykeDoorType, DykeForm } from "../../type";
import { useEffect, useState } from "react";
import { getDimensionSizeList } from "../../dimension-variants/_actions/get-size-list";
import { isComponentType } from "../../overview/is-component-type";

export type DoorSize = {
    dim: string;
    width: string;
    dimFt: string;
    price: number;
};
export function useDoorSizes(
    form: UseFormReturn<DykeForm>,
    rowIndex,
    productTitle
) {
    const doorPrice = form.getValues(
        `itemArray.${rowIndex}.multiComponent.components.${productTitle}.stepProduct.door.meta.doorPrice`
    );
    const isType = isComponentType(
        form.getValues(
            `itemArray.${rowIndex}.item.housePackageTool.doorType`
        ) as DykeDoorType
    );
    const height = form.getValues(
        `itemArray.${rowIndex}.item.housePackageTool.height`
    );
    const [sizes, setSizes] = useState<DoorSize[]>([]);
    useEffect(() => {
        (async () => {
            const _sizes = await getDimensionSizeList(height, isType.bifold);
            setSizes(
                _sizes.map((s) => {
                    return {
                        ...s,
                        price: doorPrice[s.dimFt],
                    };
                })
            );
        })();
    }, []);
    return {
        sizes,
        isType,
    };
}
