"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable2 } from "./table/data-table-2";
import { DataTableFacetedFilter } from "./table/data-table-faceted-filter";
import { DataTableFacetedDate } from "./table/data-table-facetted-date";
import { DataTablePagination } from "./table/data-table-pagination";
import { DataTableSearchBar } from "./table/data-table-search-bar";
import { DataTableToolbar } from "./table/data-table-toolbar";
import { _useReactTable } from "./table/table";

interface ClientListProps<T> extends HTMLDivElement {
  columns: ColumnDef<T, unknown>[];
  search?: Boolean;
  filters?: IDataTableFilters[];
  data?;
  paginate?: Boolean;
}
export interface IDataTableFilters {
  type: "text" | "select" | "date";
  key: string;
  options?: { label; value }[];
  dateFilterTypes?: { label?; value? }[];
  rangeSwitch?: Boolean;
}
export default function ClientList<T>({
  children,
  filters,
  search,
  columns,
  data = [],
  paginate,
}: ClientListProps<T>) {
  const tableCtx = _useReactTable({
    columns,
  });

  return (
    <div className="space-y-4">
      {(search || filters?.length > 9) && (
        <DataTableToolbar
          search={search}
          table={tableCtx.table}
          isFiltered={tableCtx.isFiltered}
        >
          {filters?.map(({ type, ...props }, i) => {
            const Node: any =
              type == "date"
                ? DataTableFacetedDate
                : type == "select"
                ? DataTableFacetedFilter
                : DataTableSearchBar;
            return <Node {...props} key={i} />;
          })}
        </DataTableToolbar>
      )}
      <DataTable2 data={data} ctx={tableCtx} />
      <DataTablePagination table={tableCtx.table} />
    </div>
  );
}
