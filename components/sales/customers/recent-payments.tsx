"use client";

import {
    Cell,
    PrimaryCellContent,
    SecondaryCellContent
} from "@/components/columns/base-columns";
import {
    OrderIdCell,
    OrderInvoiceCell
} from "@/components/columns/sales-columns";
import Money from "@/components/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/use-day";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { ICustomer } from "@/types/customers";

interface Props {
    className?;
}
export default function RecentPayments({ className }: Props) {
    const customer: ICustomer = useAppSelector(s => s.slicers.dataPage.data);

    return (
        <Card className={cn(className)}>
            <CardHeader>
                <CardTitle>
                    <span>Payment History</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {customer?.payments?.map((item, key) => (
                            <TableRow key={key}>
                                <TableCell className="p-1">
                                    {/* <p>{item.orderId}</p> */}
                                    <p>{item.createdAt as any}</p>
                                </TableCell>
                                <TableCell className="p-1">
                                    {/* <p>{item.orderId}</p> */}
                                    <p>{item.meta?.checkNo}</p>
                                </TableCell>

                                <TableCell align="right" className="p-1">
                                    <Money
                                        value={item.amount}
                                        className="font-medium"
                                    />

                                    <span className="text-muted-foreground">
                                        {item?.meta?.paymentOption ||
                                            item?.meta?.payment_option}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
