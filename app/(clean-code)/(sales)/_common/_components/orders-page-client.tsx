"use client";

import { use } from "react";
import { GetSalesOrdersDta } from "../data-access/sales-list-dta";
import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { DataTable } from "@/components/(clean-code)/data-table";
import { Cells } from "./orders-page-cells";
import { TableToolbar } from "@/components/(clean-code)/data-table/toolbar";

interface Props {
    promise;
}
export default function OrdersPageClient({ promise }: Props) {
    const resp: GetSalesOrdersDta = use(promise);

    const table = useTableCompose(resp.data, {
        cells(ctx) {
            return [
                ctx.Column("Order #", Cells.Order),
                ctx.Column("Customer", Cells.Customer),
                ctx.Column("Address", Cells.Address),
                ctx.Column("Rep", Cells.SalesRep),
                ctx.Column("Invoice", Cells.Invoice),
                ctx.Column("Dispatch", Cells.Dispatch),
                ctx.Column("Status", Cells.Status),
            ];
        },
        filterCells: ["_q"],
    });
    return (
        <div>
            <DataTable {...table.props}>
                <TableToolbar>
                    <TableToolbar.Search placeholder="sales" />
                </TableToolbar>
                <DataTable.Table />
            </DataTable>
        </div>
    );
}
