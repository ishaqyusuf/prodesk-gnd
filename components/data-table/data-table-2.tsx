import * as React from "react"
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import type {
  DataTableDateFilterColumn,
  DataTableFilterableColumn,
  DataTableSearchableColumn,
  TablePageInfo,
} from "@/types/data-table"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"

import { useDebounce } from "@/hooks/use-debounce"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { formatDate } from "@/lib/use-day"
import useQueryParams from "@/lib/use-query-params"
import * as qs from "qs";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageInfo: TablePageInfo
  filterableColumns?: DataTableFilterableColumn<TData,TValue>[]
  searchableColumns?: DataTableSearchableColumn<TData>[]
  dateFilterColumns?: DataTableDateFilterColumn<TData,TValue>[]
  newRowLink?: string
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>
  hideHeader?: Boolean
  hideFooter?: Boolean
  SelectionAction?
}

export function DataTable2<TData, TValue>({
  columns,
  data,
  pageInfo,
  filterableColumns = [],
  searchableColumns = [],
  dateFilterColumns = [],
  newRowLink, hideFooter,hideHeader,SelectionAction,
  deleteRowsAction,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  function __updateQuery(q) {
    setDataQueryString(qs.stringify(q));
  }
  // const [dataQuery, setDataQuery] = React.useState({});
  const [dataQueryString, setDataQueryString] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [pageCount, setPageCount] = React.useState(0);
  const [isFiltered, setIsFiltered] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 1,
  });
   React.useEffect(() => {
    // setItems(data);
    setPageCount(pageInfo?.pageCount || 0);
  }, [data,pageInfo]);
   
  const debouncedQuery = useDebounce(dataQueryString, 800);
  
  const { queryParams, setQueryParams } = useQueryParams();
  React.useEffect(() => {
    setQueryParams(qs.parse(debouncedQuery), true);
  }, [debouncedQuery]);
  function updateDataQuery(_sorting, cFilters, pag) {
    const params: any = {};
    params.page = pag.pageIndex + 1;
    cFilters.map((f) => {
      if (f.value) {
        if (f.id == "_date") {
          if (f.value instanceof Date)
            params.date = formatDate(f.value, "YYYY-MM-DD");
          else {
            const { from, to } = f.value;
            params.from = formatDate(from, "YYYY-MM-DD");
            params.to = formatDate(to, "YYYY-MM-DD");
          }
        } else params[f.id] = f.value; //Array.isArray(f.value) ? f.value.join(",") : f.value;
      }
    });
    _sorting.map(({ id, desc }) => {
            if (!id) return;
      params.sort = id;
      params.sort_order = desc ? "desc" : "asc";
    });
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
  function __boot(searchParams: ReadonlyURLSearchParams) {
    const _q: any = {};
    const filter: ColumnFiltersState = [];
    // let page: any = 0;
    const _params: any = {};
    searchParams.forEach((v, k) => (_params[k] = v));

    const {
      date,
      from,
      to,
      sort_order,
      page,
      // per_page = 25,
      sort: __sort,
      ...params
    } = _params;
    // params.per_page = +(params.per_page || 25);
    _q.page = page ? +page : 1;
    let sort: { id?; desc? } = __sort
      ? {
          id: __sort,
          desc: sort_order == "desc",
        }
      : {};
    if (date)
      filter.push({
        id: "_date",
        value: new Date(date),
      });
    if (from && to)
      filter.push({
        id: "_date",
        value: {
          from: new Date(from),
          to: new Date(to),
        },
      });
    [{ date, from, to }, params].map((e, i) =>
      Object.entries(e).map(([k, v]) => {
        if (!v) {
          console.log([k, v]);
          return;
        } else {
          let __value = typeof v === "string" ? (v as any)?.split(",") : [v];
          let value = __value.length > 1 ? __value : __value[0];
          if (i == 1) {
            filter.push({
              id: k as any,
              value,
            });
          }
          _q[k as any] = value;
        }
      })
    );
    // const _filtered = filters.
    if (sort.id) {
      _q.sort = sort.id;
      _q.sort_order = sort_order;
    }
    setSorting([sort as any]);
    setColumnFilters(filter as any);
    setIsFiltered(filter.length > 0);

    setPagination({
      ...pagination,
      pageIndex: _q.page - 1,
      pageSize: 20, //_q.per_page || 20,
    });

    __updateQuery(_q);
    setInitialized(true);
    console.log(_q);
    console.log(filter);
  }
  
  const searchParams = useSearchParams();
  React.useEffect(() => {
    __boot(searchParams);
  }, []);
  return (
    <div className="w-full space-y-3 overflow-auto">
      {!hideHeader && <DataTableToolbar
        table={table}
        SelectionAction={SelectionAction}
        filterableColumns={filterableColumns}
        searchableColumns={searchableColumns}
        dateFilterColumns={dateFilterColumns}
        newRowLink={newRowLink}
        deleteRowsAction={deleteRowsAction}
      />}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (!header.id.includes("_"))
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
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
                  {row.getVisibleCells().map((cell) =>  cell.id.includes("__") ? null : (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  )).filter(Boolean)}
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
      { !hideFooter && <DataTablePagination pageInfo={pageInfo} table={table} />}
    </div>
  )
}
