"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";

import { DataTable } from "@/components/(clean-code)/data-table";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";

import { DispatchCells } from "./dispatch-page-cells";
import { DispatchOverviewSheet } from "../../../_common/_components/overview-sheet/order-overview-sheet";
import { __filters } from "../../../_common/utils/contants";
import { QueryTabAction } from "@/app/(clean-code)/_common/query-tab/query-tab-edit";
import QueryTab from "@/app/(clean-code)/_common/query-tab";

interface Props {
    queryKey?;
    filterFields;
}
export default function DeliveryPageClient({ queryKey, filterFields }: Props) {
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

                ...__filters()["sales-delivery"].filterColumns,
            ];
        },
        checkable: true,
        filterFields,
        cellVariants: {
            size: "sm",
        },
        passThroughProps: {},
    });

    return (
        <div className="bg-white">
            <DataTable.Infinity
                checkable
                ActionCell={DispatchCells.Action}
                queryKey={queryKey}
                {...table.props}
            >
                <div className="flex justify-between">
                    <div className="w-1/2">
                        <DataTableFilterCommand />
                    </div>
                    <DataTableInfinityToolbar />
                </div>
                <DataTable.Header top="lg" className="bg-white">
                    <div className="flex justify-between items-end mb-2 gap-2 sm:sticky">
                        <div className="">
                            <QueryTab page="orders" />
                        </div>
                        <div className="flex-1"></div>
                        <QueryTabAction />
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
                <DispatchOverviewSheet />
            </DataTable.Infinity>
        </div>
    );
}
