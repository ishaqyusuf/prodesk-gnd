"use client";

import { PromiseType } from "@/types";
import getPayablesAction from "./get-payables";
import React from "react";
import useDataTableColumn from "@/components/common/data-table/columns/use-data-table-columns";
import { PayableCells } from "./payable-cells";
import { DataTable2 } from "@/components/_v1/data-table/data-table-2";

export type PayableProm = PromiseType<typeof getPayablesAction>;
interface Props {
    promise: PayableProm["Promise"];
}
export default function PayablesTable({ promise }: Props) {
    const { data, pageCount } = React.use(promise);
    const table = useDataTableColumn(
        data,
        (ctx) => [
            ctx.Column("Customer", PayableCells.Customer),
            ctx.Column("Order", PayableCells.Order),
            ctx.Column("Invoice", PayableCells.Invoice),
            ctx.Column("Due Date", PayableCells.DueDate),
            ctx.ActionColumn(PayableCells.Options),
        ],
        true,
        { sn: true, filterCells: ["_q"] }
    );
    return (
        <div>
            <DataTable2
                columns={table.columns}
                data={data}
                pageCount={pageCount}
                searchableColumns={[{ id: "_q" as any, title: "payables" }]}
            />
        </div>
    );
}
