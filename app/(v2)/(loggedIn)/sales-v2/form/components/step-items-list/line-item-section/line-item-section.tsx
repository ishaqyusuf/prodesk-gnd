import { TableCell } from "@/components/ui/table";
import { DykeItemFormContext, useDykeForm } from "../../../_hooks/form-context";
import { useContext } from "react";
import ControlledInput from "@/components/common/controls/controlled-input";
import Money from "@/components/_v1/money";
import { useMultiComponentItem } from "../../../_hooks/use-multi-component-item";
import ConfirmBtn from "@/components/_v1/confirm-btn";
import useMultiDykeForm from "../../../_hooks/use-multi-generator";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";

interface Props {
    componentTitle;
    mdf;
}
export default function LineItemSection({ componentTitle, mdf }: Props) {
    const form = useDykeForm();

    const item = useContext(DykeItemFormContext);
    const componentItem = useMultiComponentItem(componentTitle);
    const rootKey = `itemArray.${item.rowIndex}.item`;
    const isMoulding = item.isType.moulding;
    return (
        <>
            <TableCell className="">
                {isMoulding ? (
                    componentTitle
                ) : (
                    <ControlledInput
                        list
                        control={form.control}
                        name={`${componentItem.rootKey}.description` as any}
                    />
                )}
            </TableCell>
            {item.isType.service && (
                <TableCell className="w-[50px]">
                    <ControlledCheckbox
                        control={form.control}
                        switchInput
                        name={`${componentItem.rootKey}.tax` as any}
                    />
                </TableCell>
            )}
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
            <TableCell className="w-[100px]">
                <ConfirmBtn
                    onClick={() => componentItem.removeLine(mdf.removeTab)}
                    size="icon"
                />
            </TableCell>
        </>
    );
}
