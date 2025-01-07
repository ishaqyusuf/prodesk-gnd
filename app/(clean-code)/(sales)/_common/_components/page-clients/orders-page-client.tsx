"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import {
    DataTable,
    InfiniteDataTablePageProps,
} from "@/components/(clean-code)/data-table";
import { OrderCells as Cells } from "../orders-page-cells";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";

import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import { _modal } from "@/components/common/modal/provider";
import { OrderOverviewSheet } from "../overview-sheet/order-overview-sheet";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { __filters } from "../../utils/contants";
import QueryTab from "@/app/(clean-code)/_common/query-tab";
import { QueryTabAction } from "@/app/(clean-code)/_common/query-tab/query-tab-edit";
import { Menu } from "@/components/(clean-code)/menu";
import { openPayPortal } from "../pay-portal";
import { openTxForm } from "../tx-form";

export default function OrdersPageClient({
    filterFields,
    queryKey,
}: InfiniteDataTablePageProps) {
    // const filters =
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
                ...__filters().orders.filterColumns,
            ];
        },
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
        <div className="bg-white">
            <DataTable.Infinity
                checkable
                ActionCell={Cells.Action}
                queryKey={queryKey}
                {...table.props}
            >
                <DataTable.BatchAction>
                    <Menu>
                        <Menu.Trash action={() => {}}>Delete</Menu.Trash>
                    </Menu>
                </DataTable.BatchAction>
                <DataTable.Header top="lg" className="bg-white">
                    <div className="flex justify-between items-end mb-2 gap-2 sm:sticky">
                        <div className="">
                            <QueryTab page="orders" />
                        </div>
                        <div className="flex-1"></div>
                        <QueryTabAction />
                        <Button
                            onClick={() => {
                                openTxForm({});
                            }}
                            variant="destructive"
                            size="sm"
                        >
                            <Icons.dollar className="size-4 mr-2" />
                            <span>Pay Portal</span>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/sales-book/create-order">
                                <Icons.add className="size-4 mr-2" />
                                <span>New</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex-1">
                            <DataTableFilterCommand />
                        </div>
                        <DataTableInfinityToolbar />
                    </div>
                </DataTable.Header>
                <DataTable.Table />
                <DataTable.LoadMore />
                <OrderOverviewSheet />
            </DataTable.Infinity>
        </div>
    );
}
