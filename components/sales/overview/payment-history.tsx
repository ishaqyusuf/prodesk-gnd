"use client";

import Money from "@/components/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { openModal } from "@/lib/modal";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { ISalesOrder } from "@/types/sales";
import { Plus } from "lucide-react";

export default function PaymentHistory() {
  const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);

  return (
    <div className="col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment History</span>
            <div>
              <Button
                onClick={() => {
                  openModal("salesPayment", [order]);
                }}
                className="h-8 w-8 p-0"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="">
          <Table>
            <TableBody>
              {order.payments?.map((item, key) => (
                <TableRow key={key}>
                  <TableCell className="p-1">
                    {/* <p>{item.orderId}</p> */}
                    <p>{item.createdAt as any}</p>
                  </TableCell>

                  <TableCell className="p-1 text-left">
                    <Money value={item.amount} className="font-medium" />
                    <p className="text-muted-foreground">
                      {item?.meta?.paymentOption ||
                        item?.meta?.payment_option ||
                        order?.meta?.payment_option}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
