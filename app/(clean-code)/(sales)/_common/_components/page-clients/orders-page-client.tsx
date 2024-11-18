"use client";

import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { DataTable } from "@/components/(clean-code)/data-table";
import { OrderCells as Cells } from "../orders-page-cells";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import { salesSearchSchema } from "../../_schema/base-order-schema";
import { getSalesOrderInfinityListUseCase } from "../../use-case/sales-list-use-case";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";
import { _modal } from "@/components/common/modal/provider";
import { OrderOverviewSheet } from "../overviews/sales-overview/order-overview-sheet";

interface Props {
    // promise;
    filterFields;
    searchParams;
    filterOptions?;
    queryKey;
}
export default function OrdersPageClient({
    searchParams,
    filterFields,
    filterOptions,
    queryKey,
}: Props) {
    console.log({ filterFields });
    console.log({ filterOptions });

    const table = useTableCompose({
        cells(ctx) {
            return [
                ctx.Column("Date", "date", Cells.Date),
                ctx.Column("Order #", "orderId", Cells.Order),
                ctx.Column("P.O", "po", Cells.Po),
                ctx.Column("Customer", "customer", Cells.Customer),
                ctx.Column("Phone", "phone", Cells.CustomerPhone),
                ctx.Column("Address", "address", Cells.Address),
                ctx.Column("Rep", "rep", Cells.SalesRep),
                ctx.Column("Invoice", "invoice", Cells.Invoice),
                ctx.Column("Pending", "pending", Cells.InvoicePending),
                ctx.Column("Dispatch", "dispatch", Cells.Dispatch),
                ctx.Column("Production", "production", Cells.Production),
                // ctx.Column("Delivery", "delivery", Cells.Delivery),
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
