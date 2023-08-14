import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { deepCopy } from "@/lib/deep-copy";
import { openComponentModal } from "@/lib/sales/sales-invoice-form";

import React, { useEffect, useState } from "react";

export default function ItemCell({ rowIndex, form }) {
  const { register } = form;
  // const orderItemComponentSlice = useAppSelector(
  //   (state) => state.orderItemComponent
  // );

  const baseKey = `items.${rowIndex}`;
  const isComponent = form.watch(`${baseKey}.meta.isComponent`);
  const item = form.watch(baseKey);
  const getCellValue = () => form.getValues(`items.${rowIndex}.description`);
  const [cellValue, setCellValue] = useState(getCellValue() || undefined);
  useEffect(() => {
    setCellValue(getCellValue() || undefined);
  }, [rowIndex]);
  return (
    <TableCell
      onClick={() => {
        if (isComponent) openComponentModal(deepCopy(item), rowIndex);
      }}
      id="description"
      className="cursor-pointer p-0 px-1"
    >
      {/* <Input
        className="h-8 w-full p-1 font-medium"
        {...register(`${baseKey}.description`)}
      /> */}
      {isComponent == true ? (
        <button className="p-0.5">
          <div
            // dangerouslySetInnerHTML={{
            //   __html: form.getValues(`${baseKey}.description`),
            // }}
            className="line-clamp-2s font-medium text-primary text-sm relative w-full p-0.5 text-start"
          >
            {form.getValues(`${baseKey}.description`)}
          </div>
        </button>
      ) : (
        <Input
          className="h-8 w-full p-1 font-medium"
          // {...register(`${baseKey}.description`)}
          value={cellValue}
          onChange={(e) => {
            setCellValue(e.target.value);
            form.setValue(`items.${rowIndex}.description`, e.target.value);
          }}
        />
      )}
    </TableCell>
  );
}
