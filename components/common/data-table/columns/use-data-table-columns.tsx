"use client";

import { ColumnDef } from "@tanstack/react-table";
import React, { ReactElement, useState } from "react";
import { useDatableCheckbox } from "./checkbox";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { toast } from "sonner";
import { RowActionCell } from "@/components/_v1/data-table/data-table-row-actions";
import { TableCol } from "../table-cells";

type CellValueType<T> = ((item: T) => any) | keyof T;
type CtxType<T> = {
    PrimaryColumn(title, value: CellValueType<T>): ColumnDef<T, unknown>;
    Column(title, Column: ({ item }: { item: T }) => React.ReactElement);
    ActionColumn(Column: ({ item }: { item: T }) => React.ReactElement);
    Primary({ children });
    Secondary({ children });
    queryFields(...ids);
};
interface Props {
    deleteAction?;
    sn?: boolean;
    snId?: string;
    snDate?: string;
    snTitle?: string;
    filterCells?: string[];
}
export default function useDataTableColumn<T>(
    data: T[],
    cells: (ctx: CtxType<T>) => ColumnDef<T, unknown>[],
    checkable = true,
    props?: Props
) {
    const [isPending, startTransition] = React.useTransition();
    // type ValueType = typeof keyof T;
    const checkBox = useDatableCheckbox(data);

    const ctx: CtxType<T> = {
        startTransition,
        addColumns(...__columns) {
            // _setColumns(__columns);
        },
        Column(title, Column: ({ item }: { item: T }) => React.ReactElement) {
            return {
                accessorKey: title.toLowerCase(),
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={title} />
                ),
                cell: ({ cell }) => <Column item={cell.row.original} />,
            };
        },
        queryFields(...ids) {
            return ids.map((id) => ({ accessorKey: id, enableHiding: false }));
        },
        Primary({ children }) {
            return <p className="font-semibold">{children}</p>;
        },
        Secondary({ children }) {
            return <p className="text-muted-foreground">{children}</p>;
        },
        PrimaryColumn(
            title,
            Value:
                | CellValueType<T>
                | (({ data }: { data: T }) => React.ReactElement)
        ): ColumnDef<T, unknown> {
            return {
                accessorKey: title.toLowerCase(),
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={title} />
                ),
                cell: ({ cell }) => {
                    const Cell: any = React.isValidElement(Value)
                        ? Value
                        : (undefined as any);
                    if (Cell) return <Cell data={cell.row.original} />;
                    const PrimaryNode = this.Primary;
                    return (
                        <PrimaryNode>
                            {cell.row.original[Value as any]}
                        </PrimaryNode>
                    );
                },
            };
        },
        ActionColumn(Column: ({ item }: { item: T }) => React.ReactElement) {
            return {
                id: "action",
                cell: ({ cell }) => (
                    <div className="flex justify-end items-center space-x-2">
                        <Column item={cell.row.original} />
                    </div>
                ),
            };
        },
    } as any;
    const SnCol = ctx.Column(props?.snTitle || "#", ({ item }) => (
        <TableCol>
            <TableCol.Primary>
                {(item as any)?.[props?.snId || "id"]}
            </TableCol.Primary>
            <TableCol.Secondary>
                <TableCol.Date>
                    {(item as any)?.[props?.snDate || "createdAt"]}
                </TableCol.Date>
            </TableCol.Secondary>
        </TableCol>
    ));
    const columns = React.useMemo<ColumnDef<T, unknown>[]>(
        () =>
            [
                checkable && checkBox.column,
                props?.sn && SnCol,
                ...cells(ctx),
                ...(props?.filterCells?.map((fs) => {
                    return {
                        accessorKey: fs,
                        enableHiding: false,
                    };
                }) as any),
            ].filter(Boolean) as any,
        [data, isPending]
    );
    return {
        ...ctx,
        columns,
        ...checkBox,
        deleteSelectedRow() {
            toast.promise(
                Promise.all(
                    checkBox.selectedRowIds.map((id) =>
                        props?.deleteAction?.(id)
                    )
                ),
                {
                    loading: "Deleting...",
                    success: () => {
                        checkBox.setSelectedRowIds([]);
                        return "Products deleted successfully.";
                    },
                    error: (err: unknown) => {
                        checkBox.setSelectedRowIds([]);
                        //  return catchError(err);
                        return "";
                    },
                }
            );
        },
    };
}
