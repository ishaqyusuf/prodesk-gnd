import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
    dataTableContext,
    TableRowModel,
    useDataTable,
    useDataTableContext,
    useInifinityDataTable,
} from "./use-data-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Fragment, useEffect } from "react";
import { DataTablePagination } from "@/components/common/data-table/data-table-pagination";
import { TableCellProps } from "./table-cells";
import { useInfiniteDataTable } from "./use-infinity-data-table";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { formatCompactNumber } from "@/lib/format";
import { TableProps } from "./use-table-compose";

import { usePathname } from "next/navigation";
import { __revalidatePath } from "@/app/(v1)/_actions/_revalidate";

interface BaseProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    children?;
    cellVariants?: TableCellProps;
    addFilterCol?(col: String);
    schema;
    filterFields;
}
function BaseDataTable<TData, TValue>({
    children,
    ...props
}: // data,
// pageCount,
// columns,
// cellVariants,
// addFilterCol,
BaseProps<TData, TValue>) {
    const ctx = useDataTable(props as any);

    return (
        <dataTableContext.Provider value={ctx}>
            <div className="w-full space-y-3 overflow-auto">{children}</div>
        </dataTableContext.Provider>
    );
}
function Infinity({ children, ...props }: { children; queryKey } & TableProps) {
    const ctx = useInfiniteDataTable(props);
    // const router = useRouter();
    const path = usePathname();
    return (
        <dataTableContext.Provider value={ctx}>
            <div className="w-full space-y-3 overflow-auto min-h-[80vh] ">
                {children}
            </div>
        </dataTableContext.Provider>
    );
}
function _Table({}) {
    const { table, columns } = useDataTableContext();

    return (
        <div
            // className="sm:border sm:rounded-lg"
            className="flex w-full smin-h-screen sh-full flex-col sm:flex-row  rounded-lg shadow border"
        >
            <Table>
                <TableHeader className={cn("")}>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header, index) => {
                                if (!header.id.includes("__"))
                                    return (
                                        <TableHead
                                            key={`${header.id}_${index}`}
                                            className="whitespace-nowrap"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table
                            .getRowModel()
                            .rows.map((row, index) => (
                                <Tr rowIndex={index} key={row.id} row={row} />
                            ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
interface TrProps {
    rowIndex;
    row: TableRowModel;
}
function Tr({ row, rowIndex }: TrProps) {
    return (
        <TableRow
            className={cn("")}
            onClick={() => row.toggleSelected()}
            data-state={row.getIsSelected() && "selected"}
        >
            {row
                .getVisibleCells()
                .map((cell, index) =>
                    cell.id.includes("__") ? null : (
                        <Fragment key={`${cell.id}_cell_${index}`}>
                            {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )}
                        </Fragment>
                    )
                )
                .filter(Boolean)}
        </TableRow>
    );
}
function Footer() {
    const { table, columns } = useDataTableContext();
    return <DataTablePagination table={table} />;
}
function LoadMore() {
    const {
        table,
        columns,
        totalRowsFetched,
        filterRows,
        isFetching,
        totalRows,
        fetchNextPage,
        isLoading,
    } = useInifinityDataTable();
    return (
        <div className="flex justify-center">
            {totalRows > totalRowsFetched ||
            !table.getCoreRowModel().rows?.length ? (
                <Button
                    disabled={isFetching || isLoading}
                    onClick={() => fetchNextPage()}
                    size="sm"
                    variant="outline"
                >
                    {isFetching ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Load More
                </Button>
            ) : (
                <p className="text-muted-foreground text-sm">
                    No more data to load (total:{" "}
                    <span className="font-medium font-mono">
                        {formatCompactNumber(totalRows)}
                    </span>{" "}
                    rows)
                </p>
            )}
        </div>
    );
}
export let DataTable = Object.assign(BaseDataTable, {
    Table: _Table,
    Footer,
    Infinity,
    LoadMore,
});
