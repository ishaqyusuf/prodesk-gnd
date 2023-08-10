"use client";

import Money from "@/components/money";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { keyValue } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";

export default function CostBreakdown() {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);
  const data = [
    keyValue("Payment Option", order?.meta?.payment_option),
    keyValue("Labour", <Money value={order?.meta?.labor_cost} />),
    keyValue("Sub Total", <Money value={order?.subTotal} />),
    keyValue(`Tax ${order?.taxPercentage}%`, <Money value={order?.tax} />),
    keyValue(`Total`, <Money value={order?.grandTotal} />),
    keyValue(
      `Paid`,
      <Money value={(order.grandTotal || 0) - (order.amountDue || 0)} />
    ),
    keyValue(`Pending`, <Money value={order.amountDue || 0} />),
  ];
  return (
    <div className="col-span-1">
      <Card>
        <CardContent className="bg-gray-100">
          <Table>
            <TableBody>
              {data.map((line, index) => (
                <TableRow key={index}>
                  <TableCell className="text-muted-foreground font-bold p-1">
                    {line.key}
                  </TableCell>
                  <TableCell className="p-1.5">{line.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
