"use client";

import { ISalesOrder } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import { ICustomer } from "@/types/customers";
import { useAppSelector } from "@/store";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import {
  LinkCell,
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";
import { formatDate } from "@/lib/use-day";
import { OrderInvoiceCell } from "../columns/sales-columns";

interface Props {
  className?;
}
export default function RecentSalesCard({ className }: Props) {
  const customer: ICustomer = useAppSelector((s) => s.slicers.dataPage.data);
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent className="">
        <Table>
          <TableBody>
            {customer?.salesOrders?.map((order, key) => (
              <TableRow key={key}>
                <TableCell className="p-1">
                  <LinkCell
                    row={order}
                    link="/sales/order/slug"
                    slug={order.orderId}
                  >
                    <PrimaryCellContent>{order.orderId}</PrimaryCellContent>
                    <SecondaryCellContent>
                      {formatDate(order.createdAt)}
                    </SecondaryCellContent>
                  </LinkCell>
                </TableCell>
                <TableCell className="p-1">
                  <div>
                    <OrderInvoiceCell order={order} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
