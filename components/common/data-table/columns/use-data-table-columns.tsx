"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { useDatableCheckbox } from "./checkbox";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { toast } from "sonner";
import { TableCol } from "../table-cells";
import { TableCellProps } from "@/app/_components/data-table/table-cells";

type CellValueType<T> = ((item: T) => any) | keyof T;
interface ColumnArgs {
    noTitle?: boolean;
}
type CtxType<T> = {
    PrimaryColumn(title, value: CellValueType<T>): ColumnDef<T, unknown>;
    Column(
        title,
        Column: ({ item }: { item: T }, args: ColumnArgs) => React.ReactElement,
        args?: ColumnArgs
    );
    ActionColumn(Column: ({ item }: { item: T }) => React.ReactElement);
    Primary({ children });
    Secondary({ children });
    queryFields(...ids);
};
interface Props<T> {
    deleteAction?;
    sn?: boolean;
    snId?: string;
    snIdFn?(item: T);
    snDate?: string;
    snTitle?: string;
    checkable?: boolean;
    filterCells?: string[];
    pageCount?;
    cellVariants?: TableCellProps;
}
export function useDataTableColumn3<T>(data: T) {
    const ctx = {
        _props: {},
        cells: null,
        props(c: Props<T>) {
            ctx._props = c;
            return ctx;
        },
        table() {
            // return useDataTableColumn2(data,ctx._props,ctx.cells);
        },
    };
    return ctx;
}
export function useDataTableColumn2<T>(
    data: T[],
    props: Props<T>,
    cells: (ctx: CtxType<T>) => ColumnDef<T, unknown>[]
) {
    return useDataTableColumn(data, cells, props?.checkable, props);
}

export default function useDataTableColumn<T>(
    data: T[],
    cells: (ctx: CtxType<T>) => ColumnDef<T, unknown>[],
    checkable = true,
    props?: Props<T>
) {
    const [isPending, startTransition] = React.useTransition();
    // type ValueType = typeof keyof T;
    const checkBox = useDatableCheckbox(data);

    const ctx: CtxType<T> = {
        startTransition,
        addColumns(...__columns) {
            // _setColumns(__columns);
        },
        Column(
            title,
            Column: ({ item }: { item: T }) => React.ReactElement,
            args?: ColumnArgs
        ) {
            return {
                accessorKey: title.toLowerCase(),
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title={args?.noTitle ? "" : title}
                    />
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
                {props?.snIdFn
                    ? props.snIdFn(item)
                    : (item as any)?.[props?.snId || "id"]}
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
                ...((props?.filterCells || [])?.map((fs) => {
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
        props: {
            columns,
            data,
            pageCount: props?.pageCount,
            cellVariants: props?.cellVariants,
        },
    };
}
