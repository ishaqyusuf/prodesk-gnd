"use client";

import { useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as qs from "qs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { useRouter, useSearchParams } from "next/navigation";
import __useTableQuery, { ITableIndexNames } from "./use-table";
import useQueryParams from "@/lib/use-query-params";
import { useDebounce } from "@/lib/use-debounce";
// import { useQuery } from "@tanstack/react-query";

// import { DataTablePagination } from "../components/data-table-pagination";
// import { DataTableToolbar } from "../components/data-table-toolbar";

interface DataTableProps<TData, TValue> {
  // columns: ColumnDef<TData, TValue>[];
  data?: any;
  baseQuery?;
  ctx;
  tableIndexName?: ITableIndexNames;
}
interface IDataState {
  pagination: PaginationState;
  sorting: SortingState;
  isFiltered: Boolean;
  columnFilters: ColumnFiltersState;
}
export function DataTable2<TData, TValue>({
  ctx,
  tableIndexName,
  baseQuery,
  data,
}: DataTableProps<TData, TValue>) {
  const {
    table,
    columns,
    setIsFiltered,
    setColumnFilters,
    columnFilters,
    setPagination,
    setSorting,
    __updateQuery,
    setInitialized,
    dataQueryString,
    dataQuery,
    setPageCount,
    setData,
    isFiltered,
    __boot,
    pagination,
    initialized,
  } = ctx;
  useEffect(() => {
    setData(data?.items);
    setPageCount(data.pageInfo?.pageCount);
  }, [data]);
  //   const router = useRouter();
  const searchParams = useSearchParams();
  //   console.log(q.keys().);
  function transformResult(results) {
    return results;
  }

  const { queryParams, setQueryParams } = useQueryParams();

  useEffect(() => {
    __boot(searchParams);
  }, []);

  const debouncedQuery = useDebounce(dataQueryString, 800);
  useEffect(() => {
    setQueryParams(qs.parse(debouncedQuery), true);
  }, [debouncedQuery, setQueryParams]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // if(header.)
                  if (!header.id.includes("_"))
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row
                    .getVisibleCells()
                    .map((cell) =>
                      cell.id.includes("__") ? null : (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    )
                    .filter(Boolean)}
                </TableRow>
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
    </div>
  );
}
