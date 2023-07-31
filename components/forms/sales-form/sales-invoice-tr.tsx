"use client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { store, useAppSelector } from "@/store";
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";

import { Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { useLoader } from "@/lib/use-loader";
import { timeout } from "@/lib/timeout";
import { CheckedState } from "@radix-ui/react-checkbox";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { FormField } from "@/components/ui/form";
import { ISalesOrder, ISalesOrderForm } from "@/types/sales";
import Combobox from "@/components/combo-box";
import ItemCell from "./item-cell";
import QtyCostCell from "./qty-cost-cell";
import { Label } from "@/components/ui/label";
import { addLine } from "@/lib/sales/sales-invoice-form";
import { updateFooterInfo } from "@/store/invoice-item-component-slice";
import { SalesFormCtx } from "@/app/_actions/sales-form";
import InvoiceTableRowAction from "./invoice-table-row-action";

interface IProps {
  rowIndex;
  field;
  form;
  replace;
  ctx: SalesFormCtx;
}

export const SalesInvoiceTr = ({
  field,
  replace,
  form,
  ctx,
  rowIndex: i,
}: IProps) => {
  //   const orderFormSlice = useAppSelector((state) => state.orderForm);
  const watchItems = form.watch("items");
  return (
    <TableRow className="border-b-0 hover:bg-none">
      <TableCell className="p-0 px-1 font-medium">{i + 1}</TableCell>
      <TableCell id="component" className="p-0 px-1">
        <FormField<ISalesOrder>
          name={`items.${i}.meta.isComponent`}
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id="component"
              checked={field.value as CheckedState}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </TableCell>
      <ItemCell rowIndex={i} form={form} />
      <TableCell id="swing" className="p-1">
        <Combobox
          keyName={`items.${i}.swing`}
          className="w-24"
          id="swing"
          allowCreate
          form={form}
          list={ctx.swings}
        />
      </TableCell>
      <TableCell id="supplier" className="p-0 px-1">
        <Combobox
          keyName={`items.${i}.meta.supplier`}
          id="swing"
          allowCreate
          form={form}
          list={ctx.suppliers}
        />
      </TableCell>
      <QtyCostCell form={form} rowIndex={i} />

      <TotalCell form={form} rowIndex={i} />

      <TableCell id="tax" align="center" className="p-0 px-1">
        <TaxSwitchCell form={form} rowIndex={i} />
      </TableCell>
      <InvoiceTableRowAction
        form={form}
        rowIndex={i}
        addLine={(toIndex) => replace(addLine(toIndex, watchItems as any))}
      />
    </TableRow>
  );
};
function TotalCell({ rowIndex, form }) {
  const baseKey = `items.${rowIndex}`;
  const itemTotal = form.watch(`${baseKey}.total`);
  return (
    <TableCell align="right" id="total" className="p-0 px-1">
      <Label>{itemTotal || "0.00"}</Label>
    </TableCell>
  );
}
function TaxSwitchCell({
  form,
  rowIndex,
}: {
  form: ISalesOrderForm;
  rowIndex;
}) {
  const keyName: any = `items.${rowIndex}.meta.tax`;
  const [checked, setChecked] = React.useState<CheckedState | undefined>(true);
  React.useEffect(() => {
    const v = form.getValues(keyName) == "Non";
    if (v) setChecked(false);
  }, []);
  return (
    <Checkbox
      className=""
      id="tax"
      checked={checked}
      onCheckedChange={(e) => {
        setChecked(e);
        form.setValue(keyName, e ? "Tax" : "Non");
        store.dispatch(
          updateFooterInfo({
            rowIndex,
            notTaxxed: !e,
          })
        );
      }}
    />
  );
}
