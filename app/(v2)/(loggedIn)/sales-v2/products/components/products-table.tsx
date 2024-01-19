"use client";

import { SmartTable } from "@/components/_v1/data-table/smart-table";
import { TableShellProps } from "@/types/data-table";
import { getDykeProducts } from "../_actions/get-dyke-products";
import { useMemo } from "react";
import { DataTable2 } from "@/components/_v1/data-table/data-table-2";
import { ColumnDef } from "@tanstack/react-table";

export type IDykeProduct = Awaited<
    ReturnType<typeof getDykeProducts>
>["data"][0];
export default function ProductsTable({ data, pageInfo }: TableShellProps) {
    const table = SmartTable<IDykeProduct>(data);

    const columns = useMemo<ColumnDef<IDykeProduct, unknown>[]>(
        () => [
            table.checkColumn(),
            table.simpleColumn("Product", (data) => ({
                story: [
                    table.primaryText(data.title),
                    table.secondary(data.description),
                ],
            })),
            table.simpleColumn("Category", (data) => ({
                story: [table.primaryText(data.category?.title)],
            })),
            table.simpleColumn("Qty", (data) => ({
                story: [table.primaryText(data.qty)],
            })),
            table.simpleColumn("Price", (data) => ({
                story: [table.primaryText(data.price)],
            })),
        ],
        [data]
    ); //table.Columns([table.checkColumn()]);

    return (
        <DataTable2
            data={data}
            columns={columns}
            pageInfo={pageInfo}
            // filterableColumns={[BuilderFilter, RolesFilter]}
            searchableColumns={[
                {
                    id: "_q" as any,
                    title: "title",
                },
            ]}
        />
    );
}
