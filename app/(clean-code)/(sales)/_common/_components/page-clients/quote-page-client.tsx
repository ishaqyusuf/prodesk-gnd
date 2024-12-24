"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { DataTable } from "@/components/(clean-code)/data-table";

import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";

import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import { _modal } from "@/components/common/modal/provider";
import { OrderOverviewSheet } from "../overview-sheet/order-overview-sheet";
import { QuotesCell } from "../quotes-page-cells";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import Link from "next/link";

interface Props {
    // promise;
    filterFields;
    searchParams;
    queryKey;
}
export default function QuotesPageClient({
    searchParams,
    filterFields,
    queryKey,
}: Props) {
    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Date", "date", QuotesCell.Date),
                ctx.Column("Order #", "orderId", QuotesCell.Order),
                ctx.Column("P.O", "po", QuotesCell.Po),
                ctx.Column("Customer", "customer", QuotesCell.Customer),
                ctx.Column("Phone", "phone", QuotesCell.CustomerPhone),
                ctx.Column("Address", "address", QuotesCell.Address),
                ctx.Column("Rep", "rep", QuotesCell.SalesRep),
                ctx.Column("Invoice", "invoice", QuotesCell.Invoice),
            ];
        },
        checkable: true,
        filterFields,
        cellVariants: {
            size: "sm",
        },
        passThroughProps: {
            itemClick(item) {
                // _modal.openSheet();
            },
        },
    });
    return (
        <div>
            <div className="flex justify-between mb-2 -mt-4">
                <div className="flex-1"></div>
                <Button asChild size="sm">
                    <Link href="/sales-book/create-quote?fromPage=new">
                        <Icons.add className="w-4 h-4 mr-2" />
                        <span>New</span>
                    </Link>
                </Button>
            </div>
            <DataTable.Infinity queryKey={queryKey} {...table.props}>
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <DataTableFilterCommand />
                    </div>
                    <DataTableInfinityToolbar />
                </div>
                <DataTable.Table />
                <DataTable.LoadMore />
                <OrderOverviewSheet />
            </DataTable.Infinity>
        </div>
    );
}
