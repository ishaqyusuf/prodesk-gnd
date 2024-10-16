"use client";

import { use } from "react";
import { GetSalesOrdersDta } from "../data-access/sales-dta";
import { useTableCompose } from "@/components/(clean-code)/data-table/use-table-compose";
import { DataTable } from "@/components/(clean-code)/data-table";
import { Cells } from "./orders-page-cells";
import { TableToolbar } from "@/components/(clean-code)/data-table/toolbar";
import { DataTableFilterCommand } from "@/components/(clean-code)/data-table/filter-command";
import {
    salesFilterFields,
    salesSearchSchema,
} from "../_schema/base-order-schema";
import { getSalesOrderInifityListUseCase } from "../use-case/sales-list-use-case";
import { DataTableInfinityToolbar } from "@/components/(clean-code)/data-table/infinity/data-table-toolbar";

interface Props {
    // promise;
}
export default function OrdersPageClient({}: Props) {
    // const resp: GetSalesOrdersDta = use(promise);

    const table = useTableCompose({
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
        schema: salesSearchSchema,
        filterFields: salesFilterFields,
        serverAction: getSalesOrderInifityListUseCase,
    });
    return (
        <div>
            <DataTable.Infinity {...table.props}>
                <div className="flex justify-between">
                    <div className="w-1/3">
                        <DataTableFilterCommand />
                    </div>
                    <DataTableInfinityToolbar />
                </div>
                {/* <TableToolbar>
                    <TableToolbar.Search placeholder="sales" />
                </TableToolbar> */}
                <DataTable.Table />
                <DataTable.LoadMore />
            </DataTable.Infinity>
        </div>
    );
}
