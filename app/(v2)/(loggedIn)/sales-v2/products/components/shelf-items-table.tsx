"use client";
import { DataTableType, PromiseDataTable } from "@/types";
import { getShelfItems } from "../_actions/get-shelf-items";
import React, { useMemo } from "react";
import useDataTableColumn from "@/components/data-table/columns/use-data-table-columns";
import { TableCell } from "@/components/ui/table";
import { TableCol } from "@/components/data-table/table-cells";
import { deleteDykeShelfItem } from "../_actions/delete-shelf-item-action";
import { useModal } from "@/_v2/components/common/modal/provider";
import { ProductCategoryFilter } from "../../components/filters/product-category-filter";
import { DynamicFilter } from "@/components/_v1/data-table/data-table-dynamic-filter";
import { getShelfCategories } from "../_actions/get-shelf-categories";
import { DataTable2 } from "@/components/_v1/data-table/data-table-2";
import { ColumnDef } from "@tanstack/react-table";

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
                    <TableCol.Secondary>
                        {data.category?.name}
                    </TableCol.Secondary>
                </TableCol>
            )),
            ctx.Column("Price", ({ data }) => (
                <TableCol>
                    <TableCol.Primary>
                        <TableCol.Money value={data.unitPrice} />
                    </TableCol.Primary>
                </TableCol>
            )),
            ctx.ActionColumn(({ data }) => (
                <>
                    <TableCol.Btn icon="edit" onClick={(e) => {}} />
                    <TableCol.DeleteRow
                        action={deleteDykeShelfItem}
                        data={data}
                    />
                </>
            )),
            ...ctx.queryFields("_q", "_categoryId"),
        ],
        true
    );
    const modal = useModal();
    return (
        <DataTable2
            columns={table.columns}
            data={data}
            pageCount={pageCount}
            searchableColumns={[
                {
                    id: "_q" as any,
                    title: "products",
                },
            ]}
            filterableColumns={[
                ({ table }) => (
                    <DynamicFilter
                        table={table}
                        single
                        title="Category"
                        columnId="_categoryId"
                        listKey={"shelfCats" as any}
                        loader={getShelfCategories}
                    />
                ),
            ]}
            BatchAction={({ table: _table }) => (
                <>
                    <TableCol.BatchDelete
                        table={_table}
                        action={deleteDykeShelfItem}
                        selectedIds={table.selectedRowIds}
                    />
                </>
            )}
            Toolbar={({ table }) => (
                <>
                    <TableCol.NewBtn onClick={() => {}} />
                </>
            )}
        />
    );
}
