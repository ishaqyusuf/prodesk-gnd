"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { priorities, statuses } from "@/app/(auth)/sales/orders/data";
import { DataTableSearchBar } from "./data-table-search-bar";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  isFiltered;
  search?: Boolean;
  viewOption?: Boolean;
  children?;
}

export function DataTableToolbar<TData>({
  table,
  children = null,
  search = false,
  isFiltered = false,
  viewOption = true,
}: DataTableToolbarProps<TData>) {
  // const isFiltered = table.
  //   table.getPreFilteredRowModel().rows.length >
  //   table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {search && <DataTableSearchBar key="_q" table={table} />}
        {children}
        {/* <DataTableFacetedFilter
          table={table}
          single
          _key="_status"
          title="Status"
          options={statuses}
        />
        <DataTableFacetedFilter
          table={table}
          _key="status"
          title="Priority"
          options={priorities}
        /> */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
