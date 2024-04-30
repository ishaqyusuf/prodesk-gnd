import { TableCell } from "@/components/ui/table";
import { DykeItemFormContext, useDykeForm } from "../../../_hooks/form-context";
import { useContext } from "react";

import ControlledInput from "@/components/common/controls/controlled-input";

import Money from "@/components/_v1/money";

import { useMultiComponentItem } from "../../../_hooks/use-multi-component-item";

interface Props {
    componentTitle;
}
export default function LineItemSection({ componentTitle }: Props) {
    const form = useDykeForm();
    const item = useContext(DykeItemFormContext);
    const componentItem = useMultiComponentItem(componentTitle);
    const rootKey = `itemArray.${item.rowIndex}.item`;
    return (
        <>
            <TableCell className="">
                {item.get.doorType() == "Moulding" ? (
                    componentTitle
                ) : (
                    <ControlledInput
                        list
                        control={form.control}
                        name={`${componentItem.rootKey}.description` as any}
                    />
                )}
            </TableCell>
            <TableCell className="w-[150px]">
                <ControlledInput
                    type="number"
                    list
                    control={form.control}
                    name={`${componentItem.rootKey}.qty` as any}
                />
            </TableCell>
            <TableCell className="w-[150px]">
                <ControlledInput
                    type="number"
                    list
                    control={form.control}
                    name={`${componentItem.rootKey}.unitPrice` as any}
                />
            </TableCell>
            <TableCell className="w-[100px]">
                <Money value={componentItem.totalPrice} />
            </TableCell>
        </>
    );
}
