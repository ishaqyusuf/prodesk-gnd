"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { DataTable } from "@/components/(clean-code)/data-table";
import { OrderCells as Cells } from "../orders-page-cells";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";

import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import { _modal } from "@/components/common/modal/provider";
import { OrderOverviewSheet } from "../overviews/sales-overview/order-overview-sheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { __filters } from "../../utils/contants";
import QueryTab from "@/app/(clean-code)/_common/query-tab";

interface Props {
    // promise;
    filterFields;
    queryKey;
}
export default function OrdersPageClient({ filterFields, queryKey }: Props) {
    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Date", "date", Cells.Date),
                ctx.Column("Order #", "order.no", Cells.Order),
                ctx.Column("P.O", "po", Cells.Po),
                ctx.Column("Customer", "customer", Cells.Customer),
                ctx.Column("Phone", "phone", Cells.CustomerPhone),
                ctx.Column("Address", "address", Cells.Address),
                ctx.Column("Rep", "rep", Cells.SalesRep),
                ctx.Column("Invoice", "invoice", Cells.Invoice),
                ctx.Column("Pending", "pending", Cells.InvoicePending),
                ctx.Column("Dispatch", "dispatch", Cells.Dispatch),
                ctx.Column("Production", "production", Cells.Production),
                ...__filters.orders.filterColumns,
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
                <div className="">
                    <QueryTab page="orders" />
                </div>
                <div className="flex-1"></div>
                <Button asChild size="sm">
                    <Link href="/sales-v2/form/order?fromPage=new">
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
                {/* </DataTable.Infinity */}

                {/* <TableToolbar>
                    <TableToolbar.Search placeholder="sales" />
                </TableToolbar> */}
                <DataTable.Table />
                <DataTable.LoadMore />
                <OrderOverviewSheet />
            </DataTable.Infinity>
        </div>
    );
}
