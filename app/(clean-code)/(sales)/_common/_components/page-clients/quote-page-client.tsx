"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { DataTable } from "@/components/(clean-code)/data-table";

import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { salesSearchSchema } from "../../_schema/base-order-schema";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import { _modal } from "@/components/common/modal/provider";
import { OrderOverviewSheet } from "../overviews/sales-overview/order-overview-sheet";
import { QuotesCell } from "../quotes-page-cells";

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
        filterCells: ["_q"],
        schema: salesSearchSchema,
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
