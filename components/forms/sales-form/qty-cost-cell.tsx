import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { store, useAppSelector } from "@/store";

import { convertToNumber, toFixed } from "@/lib/use-number";
import React, { memo } from "react";
import { ISalesOrderForm } from "@/types/sales";
import { updateFooterInfo } from "@/store/invoice-item-component-slice";

function QtyCostCell({ rowIndex, form }: { rowIndex; form: ISalesOrderForm }) {
  const { register } = form;
  const baseKey = `items.${rowIndex}`;

  //   const itemTotal = form.watch([`${baseKey}.qty`, `${baseKey}.price`] as any);

  const slice = useAppSelector((state) => state.orderItemComponent);
  const [qty, setQty] = React.useState(form.getValues(`${baseKey}.qty` as any));
  const [price, setPrice] = React.useState(
    form.getValues(`${baseKey}.price` as any)
  );
  React.useEffect(() => {
    if (rowIndex == slice.itemPriceData?.rowIndex) {
      const { price: _price, qty: _qty } = slice.itemPriceData;
      setQty(_qty);
      setPrice(_price);
    }
    // if (rowIndex == 0) console.log(rowIndex, ...itemTotal);
  }, [slice.itemPriceData, rowIndex]);
  React.useEffect(() => {
    const total = toFixed(convertToNumber(qty * price, 0));
    form.setValue(`items.${rowIndex}.qty`, qty);
    form.setValue(`items.${rowIndex}.rate`, price);
    form.setValue(`items.${rowIndex}.total`, +total);
    store.dispatch(updateFooterInfo({ rowIndex, total }));
  }, [qty, price, rowIndex]);
  function _setQty(e) {
    setQty(+e.target?.value);
    form.setValue(`items.${rowIndex}.qty`, +e.target?.value);
  }
  function _setPrice(e) {
    setPrice(+e.target?.value);
    form.setValue(`items.${rowIndex}.price`, +e.target?.value);
  }
  return (
    <>
      <TableCell id="qty" className="p-0 px-1">
        <Input
          type="number"
          className="h-8 w-full p-1 text-center font-medium"
          value={qty || ""}
          onChange={_setQty}
          //   {...register(`items.${rowIndex}.qty`)}
        />
      </TableCell>
      <TableCell id="price" className="p-0 px-1">
        <Input
          type="number"
          className="h-8 w-full p-1 text-right font-medium"
          value={price || ""}
          onChange={_setPrice}
        />
      </TableCell>
    </>
  );
}
export default memo(
  QtyCostCell,
  (prev, next) => prev.rowIndex == next.rowIndex
);
