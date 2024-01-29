"use client";
import { DataTableType, PromiseDataTable } from "@/types";
import { getShelfItems } from "../_actions/get-shelf-items";
import React from "react";
import useDataTableColumn from "@/components/data-table/columns/use-data-table-columns";
import { TableCell } from "@/components/ui/table";
import { DataTable } from "@/components/data-table/data-table";
import { TableCol } from "@/components/data-table/table-cells";

type Promise = PromiseDataTable<typeof getShelfItems>;
export type ShelfItem = Awaited<Promise>["data"][0];
// export type ShelfItem = Awaited<ReturnType<typeof getShelfItems>>["data"][0];
interface Props<T> {
    promise: Promise;
}

export default function ShelfItemsTable<T>({ promise }: Props<T>) {
    const { data, pageCount } = React.use(promise);

    const table = useDataTableColumn(
        data,
        (ctx) => [
            ctx.Column("Product", ({ data }) => (
                <TableCol>
                    <TableCol.Primary>{data.title}</TableCol.Primary>
                </TableCol>
            )),
        ],
        true
    );
    return (
        <DataTable
            columns={table.columns}
            data={data}
            pageCount={pageCount}
            filterableColumns={[]}
            searchableColumns={[]}
            newRowAction={() => {}}
            // deleteRowsAction={}
        />
    );
}
