"use client";

import debounce from "lodash.debounce";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
// import { _useAsyncDebounce } from "react-table";
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  key?;
  placeholder?;
}

export function DataTableSearchBar<TData>({
  table,
  key = "_q",
  placeholder = "Search",
}: DataTableToolbarProps<TData>) {
  return (
    <Input
      placeholder={placeholder}
      value={(table.getColumn(key)?.getFilterValue() as string) ?? ""}
      onChange={(event) =>
        table.getColumn(key)?.setFilterValue(event.target.value)
      }
      className="h-8 w-[150px] lg:w-[250px]"
    />
  );
}
