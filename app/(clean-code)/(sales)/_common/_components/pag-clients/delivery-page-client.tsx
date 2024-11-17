"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import {
    dispatchFilterFields,
    dispatchSearchSchema,
} from "../../_schema/dispatch-search-schema";
import { getSalesDispatchListUseCase } from "../../use-case/sales-dispatch-use-case";
import { DataTable } from "@/components/(clean-code)/data-table";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import DispatchOverviewSheet from "../overviews/dispatch-overview-sheet";
import { OrderCells } from "../orders-page-cells";
import { DispatchCells } from "../dispatch-page-cells";
import InfiniteScrollCommand from "@/components/(clean-code)/data-table/filter-command/inifnity-filter";

interface Props {
    queryKey?;
}
export default function DeliveryPageClient({ queryKey }: Props) {
    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Date", "date", OrderCells.Date),
                ctx.Column("Order #", "orderId", OrderCells.Order),
                ctx.Column("Customer", "customer", OrderCells.Customer),
                ctx.Column("Phone", "phone", OrderCells.CustomerPhone),
                ctx.Column("Address", "address", OrderCells.Address),
                ctx.Column("Rep", "rep", OrderCells.SalesRep),
                ctx.Column("Status", "status", DispatchCells.Status),
                ctx.Column("Progress", "progress", DispatchCells.Progress),
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
