"use client";

import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

function DataTableCheckBoxHeader({ table, setSelectedRowIds, data }) {
  return (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => {
        table.toggleAllPageRowsSelected(!!value);
        setSelectedRowIds((prev) =>
          prev.length === data.length ? [] : data.map((row) => row.id)
        );
      }}
      aria-label="Select all"
      className="translate-y-[2px]"
    />
  );
}
function DataTableCheckbox({ row, setSelectedRowIds }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => {
        row.toggleSelected(!!value);
        setSelectedRowIds((prev) =>
          value
            ? [...prev, row.original.id]
            : prev.filter((id) => id !== row.original.id)
        );
      }}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  );
}
export function useDatableCheckbox(data) {
  const [selectedRowIds, setSelectedRowIds] = React.useState<number[]>([]);

  return {
    setSelectedRowIds,
    column: {
      id: "select",
      header: (props) => (
        <DataTableCheckBoxHeader
          {...props}
          data={data}
          setSelectedRowIds={setSelectedRowIds}
        />
      ),
      cell: (props) => (
        <DataTableCheckbox {...props} setSelectedRowIds={setSelectedRowIds} />
      ),
    },
  };
}
