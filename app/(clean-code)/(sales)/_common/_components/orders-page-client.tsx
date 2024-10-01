"use client";

import { use } from "react";
import { GetSalesOrdersDta } from "../data-access/sales-list-dta";
import { useTableCompose } from "@/app/(clean-code)/_common/components/data-table/use-table-compose";
import { DataTable } from "@/app/(clean-code)/_common/components/data-table";
import { Cells } from "./orders-page-cells";

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
    });
    return (
        <div>
            <DataTable {...table.props}>
                <DataTable.Table />
            </DataTable>
        </div>
    );
}
