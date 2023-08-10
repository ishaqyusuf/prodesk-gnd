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
import { useForm, useFieldArray } from "react-hook-form";
import * as React from "react";
import { Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useLoader } from "@/lib/use-loader";
import { timeout } from "@/lib/timeout";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ISalesOrderForm } from "@/types/sales";
import { SalesInvoiceTr } from "./sales-invoice-tr";
import InvoiceTableFooter from "./invoice-table-footer";
import { moreInvoiceLines } from "@/lib/sales/sales-invoice-form";
import { SalesFormResponse } from "@/app/_actions/sales-form";
import SalesComponentModal from "@/components/modals/sales-component-modal";

export default function SalesInvoiceTable({
  form,
  data,
}: {
  form: ISalesOrderForm;
  data: SalesFormResponse;
}) {
  const { watch, control, register } = form;
  const watchItems = watch("items");
  const { fields, replace } = useFieldArray({
    control,
    name: "items",
  });

  const tableRef = React.useRef(null);
  const [floatingFooter, setFloatingFooter] = React.useState(false);

  const hideFooter = useLoader();
  React.useEffect(() => {
    const handleIntersection = (entries) => {
      const [entry] = entries;
      setFloatingFooter(entry.isIntersecting == false);
    };
    const observer = new IntersectionObserver(handleIntersection, {
      // rootMargin: "0px 0px 0px 0px",
    });

    if (tableRef.current) {
      observer.observe(tableRef.current);
    }

    return () => {
      if (tableRef.current) {
        observer.unobserve(tableRef.current);
      }
    };
  }, [hideFooter.isLoading]);
  const [isPending, startTransition] = React.useTransition();
  return (
    <div className="relative">
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead className="w-[100px]">Invoice</TableHead> */}
            <TableHead className="w-[25px] px-1">#</TableHead>
            <TableHead className="w-5 px-1">
              <Layers className="h-3.5 w-3.5" />
            </TableHead>
            <TableHead className="px-1">Item</TableHead>
            <TableHead className="w-24 px-1">Swing</TableHead>
            <TableHead className="w-24 px-1">Supplier</TableHead>
            <TableHead className="w-16 px-1 text-center">Qty</TableHead>
            <TableHead className="w-20 px-1">Cost</TableHead>
            <TableHead className="w-16 px-1 text-right">Total</TableHead>
            <TableHead className="w-12 px-1 text-center">Tax</TableHead>
            <TableHead className="w-10 px-1"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, i) => (
            <SalesInvoiceTr
              ctx={data.ctx}
              rowIndex={i}
              startTransition2={startTransition}
              isPending={isPending}
              field={field}
              form={form}
              key={field.id}
            />
          ))}
        </TableBody>
      </Table>
      <div className="flex">
        <Button
          className="w-full"
          onClick={() => {
            hideFooter.action(() => {
              replace(moreInvoiceLines(watchItems as any));
            });
          }}
          variant="ghost"
        >
          More Lines
        </Button>
      </div>
      {floatingFooter && <div className="h-[250px]"></div>}
      <div id="lastLine" ref={tableRef} className=""></div>
      <InvoiceTableFooter
        ctx={data.ctx}
        floatingFooter={floatingFooter}
        form={form}
      />
      <SalesComponentModal form={form} ctx={data.ctx} />
    </div>
  );
}
