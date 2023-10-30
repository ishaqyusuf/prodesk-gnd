"use client";

import { useAppSelector } from "@/store";
import { ISalesOrder, ISalesOrderItem } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import XProgress from "@/components/x-progress";
import { ProdItemActions } from "@/components/actions/prod-item-actions";
import { Badge } from "@/components/ui/badge";
import { IInboundOrderItems } from "@/types/sales-inbound";
import StatusBadge from "@/components/status-badge";
import { PrimaryCellContent } from "@/components/columns/base-columns";
import Money from "@/components/money";

export default function ItemDetailsSection() {
    const order: ISalesOrder = useAppSelector(s => s.slicers.dataPage.data);
    const isProd = order?.ctx?.prodPage;

    return (
        <div className="">
            <Card className="max-sm:border-none">
                <CardHeader>
                    <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent className="max-sm:-mt-4">
                    <div className="grid divide-y sm:hidden">
                        {order.items?.map((item, key) => (
                            <div className="grid py-2 gap-2" key={key}>
                                <PrimaryCellContent className="text-sm leading-relaxed">
                                    {item.description}{" "}
                                    <span className="mx-2">x{item.qty}</span>
                                </PrimaryCellContent>
                                <div className="flex items-centerspace-x-2">
                                    <p className="whitespace-nowrap font-semibold text-muted-foreground text-sm">
                                        {item.swing}
                                    </p>
                                    {item.supplier && (
                                        <Badge className="leading-none bg-accent text-accent-foreground hover:bg-accent">
                                            {item.supplier}
                                        </Badge>
                                    )}
                                    <div className="flex-1"></div>
                                    {!isProd && (
                                        <div className="text-right font-semibold text-muted-foreground text-sm">
                                            {item.total && (
                                                <Money value={item.total} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Table className="max-sm:hidden">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-1">Item</TableHead>
                                <TableHead className="px-1">Swing</TableHead>
                                <TableHead className="w-16 px-1 text-center">
                                    Qty
                                </TableHead>
                                {!isProd && (
                                    <TableHead className="t w-20 px-1 text-left">
                                        Cost
                                    </TableHead>
                                )}
                                <TableHead className="w-20 px-1">
                                    Production
                                </TableHead>
                                {isProd && (
                                    <>
                                        <TableHead className="w-20 px-1 text-left"></TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items?.map((item, key) => (
                                <TableRow key={key}>
                                    <TableCell className="p-2">
                                        <p className="uppercase">
                                            {item.description}
                                        </p>
                                        <div className="inline-flex space-x-2">
                                            {item.supplier && (
                                                <Badge className="leading-none bg-accent text-accent-foreground hover:bg-accent">
                                                    {item.supplier}
                                                </Badge>
                                            )}
                                            {item.supplier && (
                                                <ItemInbound
                                                    item={item}
                                                    inbound={
                                                        item
                                                            .inboundOrderItem?.[0]
                                                    }
                                                />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-2 ">
                                        <p className="whitespace-nowrap font-semibold text-muted-foreground">
                                            {item.swing}
                                        </p>
                                    </TableCell>
                                    <TableCell className="p-2 text-center font-semibold text-muted-foreground">
                                        <p>{item.qty}</p>
                                    </TableCell>
                                    {!isProd && (
                                        <TableCell className="p-2 text-right font-semibold text-muted-foreground">
                                            {item.total && (
                                                <span>${item.total}</span>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell className="p-2 text-muted-foreground">
                                        {item.swing ? (
                                            <div className="grid gap-1">
                                                <span>
                                                    {item.meta.produced_qty ||
                                                        0}{" "}
                                                    of {item.qty}
                                                </span>
                                                <XProgress
                                                    completed={
                                                        item.meta.produced_qty
                                                    }
                                                    total={item.qty}
                                                />
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    {isProd && (
                                        <>
                                            <TableCell className="p-2 font-semibold text-muted-foreground">
                                                {item.swing && (
                                                    <ProdItemActions
                                                        item={item}
                                                    />
                                                )}
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
function ItemInbound({
    inbound,
    item
}: {
    item: ISalesOrderItem;
    inbound?: IInboundOrderItems;
}) {
    if (!inbound) {
        if (!item.meta.produced_qty)
            return <StatusBadge>Item not available</StatusBadge>;
        return <></>;
    }
    if (inbound.location) return <Badge>{inbound.location}</Badge>;
    return <StatusBadge>{inbound.status}</StatusBadge>;
}
