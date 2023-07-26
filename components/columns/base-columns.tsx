"use client";

import { Checkbox } from "../ui/checkbox";

export interface CheckColumnProps {
  setSelectedRowIds;
  selectedRowIds;
  data;
}

export function CheckColumn({ setSelectedRowIds, data }: CheckColumnProps) {
  return {
    id: "select",
    header: ({ table }) => (
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
    ),
    cell: ({ row }) => (
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
    ),
    enableSorting: false,
    enableHiding: false,
  };
}
