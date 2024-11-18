"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import {
    dispatchFilterFields,
    dispatchSearchSchema,
} from "../../_schema/dispatch-search-schema";

import { DataTable } from "@/components/(clean-code)/data-table";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";

import { OrderCells } from "../orders-page-cells";
import { DispatchCells } from "../dispatch-page-cells";
import { DispatchOverviewSheet } from "../overviews/sales-overview/order-overview-sheet";

interface Props {
    queryKey?;
}
export default function DeliveryPageClient({ queryKey }: Props) {
    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Date", "date", DispatchCells.Date),
                ctx.Column(
                    "Dispatch #",
                    "dispatchId",
                    DispatchCells.DispatchId
                ),
                ctx.Column("Order #", "orderId", DispatchCells.Order),
                // ctx.Column("Customer", "customer", DispatchCells.Customer),
                // ctx.Column("Phone", "phone", DispatchCells.CustomerPhone),
                ctx.Column("Address", "address", DispatchCells.Address),
                ctx.Column("Rep", "rep", DispatchCells.SalesRep),
                ctx.Column("Status", "status", DispatchCells.Status),
                // ctx.Column("Progress", "progress", DispatchCells.Progress),
            ];
        },
        checkable: true,
        schema: dispatchSearchSchema,
        filterFields: dispatchFilterFields,
        cellVariants: {
            size: "sm",
        },
        passThroughProps: {},
    });

    return (
        <div>
            <DataTable.Infinity queryKey={queryKey} {...table.props}>
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <DataTableFilterCommand />
                    </div>
                    <DataTableInfinityToolbar />
                </div>
                <DataTable.Table />
                <DataTable.LoadMore />
                <DispatchOverviewSheet />
            </DataTable.Infinity>
        </div>
    );
}
