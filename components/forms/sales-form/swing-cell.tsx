"use client";

import { TableCell } from "@/components/ui/table";
import { SalesInvoiceCellProps } from "./sales-invoice-tr";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import AutoComplete from "@/components/auto-complete";

export default function SwingCell({
  rowIndex,
  ctx,
  form,
}: SalesInvoiceCellProps) {
  const getSwingValue = () => form.getValues(`items.${rowIndex}.swing`);
  const [swing, setSwing] = useState<string | undefined>(
    getSwingValue() || undefined
  );
  useEffect(() => {
    setSwing(getSwingValue() || undefined);
  }, [rowIndex]);
  return (
    <TableCell id="swing" className="p-1">
      <Input
        className="h-8 w-24  p-1  font-medium"
        value={swing}
        onChange={(e) => {
          setSwing(e.target.value);
          form.setValue(`items.${rowIndex}.swing`, e.target.value);
        }}
      />
      {/* <AutoComplete
        keyName={`items.${rowIndex}.swing`}
        className="w-24"
        id="swing"
        allowCreate
        form={form}
        list={ctx?.swings}
      /> */}
    </TableCell>
  );
}
