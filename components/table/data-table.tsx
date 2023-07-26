"use client";

import * as React from "react";
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
import { useDebounce } from "@/hooks/use-debounce";
// import { useQuery } from "@tanstack/react-query";

// import { DataTablePagination } from "../components/data-table-pagination";
// import { DataTableToolbar } from "../components/data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  baseQuery?;
  tableIndexName?: ITableIndexNames;
}
interface IDataState {
  pagination: PaginationState;
  sorting: SortingState;
  isFiltered: Boolean;
  columnFilters: ColumnFiltersState;
}
export function DataTable<TData, TValue>({
  columns,
  tableIndexName,
  baseQuery,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<
    VisibilityState
  >({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [dataQuery, setDataQuery] = React.useState({});
  const [dataQueryString, setDataQueryString] = React.useState("");
  const [data, setData] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(10);
  const [isFiltered, setIsFiltered] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 1,
  });
  //   const router = useRouter();
  const searchParams = useSearchParams();
  //   console.log(q.keys().);
  function transformResult(results) {
    return results;
  }

  const { queryParams, setQueryParams } = useQueryParams();

  React.useEffect(() => {
    const _q: any = {};
    const sort: { id?; desc? } = {};
    const filter: ColumnFiltersState = [];
    let page: any = 0;
    searchParams.forEach((v, k) => {
      if (k == "sort") sort.id = v;
      else if (k == "sort_order") sort.desc = v == "desc";
      else if (k == "page") page = v;
      else {
        _q[k] = v.split(",");
        filter.push({
          id: k,
          value: v.split(","),
        });
      }
    });
    if (sort.id) {
      _q.sort = sort.id;
      _q.sort_order = sort.desc ? "desc" : "asc";
    }
    setSorting([sort as any]);
    setColumnFilters(filter as any);
    setIsFiltered(columnFilters.length > 0);

    setPagination({
      ...pagination,
      pageIndex: page,
      pageSize: 20,
    });
    __updateQuery(_q);
    setInitialized(true);
  }, []);
  function __updateQuery(q) {
    setDataQuery(q);
    setDataQueryString(qs.stringify(q));
  }

  const debouncedQuery = useDebounce(dataQueryString, 800);
  React.useEffect(() => {
    // if (debouncedSearch) {
    // fetch(`/api/search?q=${debouncedSearch}`);
    if (initialized)
      console.log("Performing action with query:", debouncedQuery);
    async function fetchData() {
      const q = {};
      Object.entries({
        ...(dataQuery || {}),
        ...(baseQuery || {}),
      }).map(([k, v]) => {
        if (Array.isArray(v)) {
          let vals = v.filter(Boolean);
          if (vals.length == 1) q[k] = vals[0];
          else q[k] = vals;
        } else q[k] = v;
      });
      console.log("FETCHING DATA WITH Q", q);

      const { items, pageInfo } = await __useTableQuery(
        tableIndexName as ITableIndexNames,
        q
      );
      console.log(items);
      setPageCount(pageInfo?.pageCount);
      setData(transformResult(items));
    }
    fetchData();
    // table.getColumn(key)?.setFilterValue(debouncedSearch);
    // }
  }, [debouncedQuery, initialized, dataQuery, baseQuery, tableIndexName]);

  function updateDataQuery(_sorting, cFilters, pag) {
    const params: any = {};
    if (pag.pageIndex > 0) params.page = pag.pageIndex + 1;
    cFilters.map((f) => {
      if (f.value)
        params[f.id] =
          typeof f.value === "object" ? f.value.join(",") : f.value;
    });
    _sorting.map(({ id, desc }) => {
      // console.log({ id, value });
      if (!id) return;
      params.sort = id;
      params.sort_order = desc ? "desc" : "asc";
    });
    setQueryParams(params, true);
    setIsFiltered(cFilters.length > 0);
    __updateQuery(params);
  }
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    pageCount: pageCount,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange(e: any) {
      setSorting(e);
      setPagination({
        ...pagination,
        pageIndex: 0,
      });
      updateDataQuery(e(), columnFilters, { pageIndex: 0 });
    },
    onColumnFiltersChange(e: any) {
      setColumnFilters(e);
      setPagination({
        ...pagination,
        pageIndex: 0,
      });
      updateDataQuery(sorting, e(columnFilters), { pageIndex: 0 });
    },
    onPaginationChange(e: any) {
      setPagination(e);
      updateDataQuery(sorting, columnFilters, e(pagination));
    },
    // onStateChange(updater) {
    //   console.log("STATE CHANGED");
    // },
    // onSortingChange(e) {
    //   setSorting(e);
    //   console.log("===>SORTING", sorting);
    //   // console.log("SORTING", (e as any)());
    //   setPagination({
    //     ...pagination,
    //     pageIndex: 0,
    //   });
    //   refreshData(columnFilters, { pageIndex: 0 }, e());
    // },
    // onPaginationChange(e) {
    //   setPagination(e);
    //   refreshData(columnFilters, e(), sorting);
    // },
    // onColumnFiltersChange(e) {
    //   setColumnFilters(e);
    //   setPagination({
    //     ...pagination,
    //     pageIndex: 0,
    //   });
    //   refreshData(e(), { pageIndex: 0 }, sorting);
    // },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} isFiltered={isFiltered} />
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
      <DataTablePagination table={table} />
    </div>
  );
}
