"use client";

import { deleteSalesPayment } from "@/app/(v1)/_actions/sales/sales-payment";
import { DeleteRowAction } from "@/components/_v1/data-table/data-table-row-actions";
import Money from "@/components/_v1/money";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { openModal } from "@/lib/modal";
import { formatDate } from "@/lib/use-day";
import { useAppSelector } from "@/store";
import { ISalesOrder } from "@/types/sales";
import { Plus } from "lucide-react";

export default function PaymentHistory() {
    const order: ISalesOrder = useAppSelector((s) => s.slicers.dataPage.data);

    return (
        <div className="col-span-1">
            <Card className="max-sm:border-none">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Payment History</span>
                        <div>
                            <Button
                                onClick={() => {
                                    openModal("salesPayment", {
                                        ...order.customer,
                                        salesOrders: [order],
                                    });
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
                                        <p>
                                            {formatDate(item.createdAt as any)}
                                        </p>
                                    </TableCell>

                                    <TableCell align="right" className="p-1">
                                        <div>
                                            <Money
                                                value={item.amount}
                                                className="font-medium"
                                            />
                                        </div>
                                        <div className="inline-flex space-x-2">
                                            <p className="text-muted-foreground">
                                                {item?.meta?.paymentOption ||
                                                    item?.meta
                                                        ?.payment_option ||
                                                    order?.meta?.payment_option}
                                            </p>
                                            {item.meta?.checkNo && (
                                                <p>({item.meta?.checkNo})</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-1" align="right">
                                        <DeleteRowAction
                                            row={item}
                                            noRefresh
                                            noToast
                                            action={async (id) => {
                                                openModal(
                                                    "deletePaymentPrompt",
                                                    {
                                                        ...item,
                                                        order: order,
                                                    }
                                                );
                                            }}
                                        />
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
