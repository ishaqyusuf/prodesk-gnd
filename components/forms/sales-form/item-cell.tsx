import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { deepCopy } from "@/lib/deep-copy";
import { openComponentModal } from "@/lib/sales/sales-invoice-form";

import React from "react";

export default function ItemCell({ rowIndex, form }) {
  const { register } = form;
  // const orderItemComponentSlice = useAppSelector(
  //   (state) => state.orderItemComponent
  // );

  const baseKey = `items.${rowIndex}`;
  const isComponent = form.watch(`${baseKey}.meta.isComponent`);
  const item = form.watch(baseKey);
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
        <button className="">
          <div
            // dangerouslySetInnerHTML={{
            //   __html: form.getValues(`${baseKey}.description`),
            // }}
            className="line-clamp-2s  relative w-full p-0.5 text-start font-semibold"
          >
            {form.getValues(`${baseKey}.description`)}
          </div>
        </button>
      ) : (
        <Input
          className="h-8 w-full p-1 font-medium"
          {...register(`${baseKey}.description`)}
        />
      )}
    </TableCell>
  );
}
