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
import { ISalesDashboard } from "@/types/dashboard";
import Link from "next/link";
import { Button } from "../ui/button";

interface Props {
  className?;
}
export default function RecentSalesDashboardCard({ className }: Props) {
  const db: ISalesDashboard = useAppSelector((s) => s.slicers.dataPage.data);
  return (
    <Card className={cn(className)}>
      <CardHeader className="">
        <div className="flex justify-between items-center">
          <CardTitle>Recent Sales</CardTitle>
          <Button asChild variant="link">
            <Link href="/sales/orders" className="text-sm">
              All Sales
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="">
        <Table>
          <TableBody>
            {db?.recentSales?.map((order, key) => (
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
                  <LinkCell
                    row={order}
                    link="/sales/customer/slug"
                    slug={order?.customerId}
                  >
                    <PrimaryCellContent>
                      {order?.customer?.name}
                    </PrimaryCellContent>
                    <SecondaryCellContent>
                      {order?.customer?.phoneNo}
                    </SecondaryCellContent>
                  </LinkCell>
                </TableCell>
                <TableCell align="right" className="p-1">
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
