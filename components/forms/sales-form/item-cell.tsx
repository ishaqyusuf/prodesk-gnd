import { SalesFormCtx } from "@/app/_actions/sales/sales-form";
import AutoComplete from "@/components/auto-complete";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { deepCopy } from "@/lib/deep-copy";
import { openComponentModal } from "@/lib/sales/sales-invoice-form";

import React, { useEffect, useRef, useState } from "react";

export default function ItemCell({
    rowIndex,
    form,
    ctx,
}: {
    rowIndex;
    form;
    ctx?: SalesFormCtx;
}) {
    const { register } = form;
    // const orderItemComponentSlice = useAppSelector(
    //   (state) => state.orderItemComponent
    // );

    const baseKey = `items.${rowIndex}`;
    const isComponent = form.watch(`${baseKey}.meta.isComponent`);
    const item = form.watch(baseKey);
    const getCellValue = () => form.getValues(`items.${rowIndex}.description`);
    const [cellValue, setCellValue] = useState(getCellValue() || undefined);
    // const input = useRef();
    const [focused, setFocused] = useState(false);
    const [hover, setHover] = useState(false);
    useEffect(() => {
        setCellValue(getCellValue() || undefined);
    }, [rowIndex]);
    return (
        <TableCell
            onMouseEnter={(e) => setHover(true)}
            onMouseLeave={(e) => setHover(false)}
            onClick={() => {
                if (isComponent) openComponentModal(deepCopy(item), rowIndex);
                else {
                    // input?.current?.focus();
                }
            }}
            id="description"
            className="cursor-pointer p-0 px-1 py-0.5 w-auto"
        >
            {/* <Input
        className="h-8 w-full p-1 font-medium"
        {...register(`${baseKey}.description`)}
      /> */}
            {isComponent == true ? (
                <button className="border  rounded-md border-input ring-offset-background min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-1 font-medium">
                    <div
                        // dangerouslySetInnerHTML={{
                        //   __html: form.getValues(`${baseKey}.description`),
                        // }}
                        className="line-clamp-2s font-medium text-primary uppercase text-sm relative w-full p-0.5 text-start"
                    >
                        {form.getValues(`${baseKey}.description`)}
                    </div>
                </button>
            ) : (
                // <Input
                //     // ref={input}
                //     className="h-8 w-full p-1 font-medium uppercase"
                //     // {...register(`${baseKey}.description`)}
                //     value={cellValue}
                //     onChange={e => {
                //         setCellValue(e.target.value);
                //         form.setValue(
                //             `items.${rowIndex}.description`,
                //             e.target.value
                //         );
                //     }}
                // />
                <AutoComplete
                    onFocus={(e) => {
                        // console.log(e);
                        setFocused(true);
                    }}
                    onBlur={(e) => setFocused(false)}
                    options={focused ? ctx?.items : []}
                    itemText={"description"}
                    itemValue={"description"}
                    form={form}
                    uppercase
                    hideEmpty
                    formKey={`items.${rowIndex}.description`}
                    allowCreate
                />
            )}
        </TableCell>
    );
}
