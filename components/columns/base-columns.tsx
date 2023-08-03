"use client";

import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Checkbox } from "../ui/checkbox";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
export const ColumnHeader = (title) => {
  let c = ({ column }) => (
    <DataTableColumnHeader column={column} title={title} />
  );
  return c;
};
export const LinkCell = ({ row, link, children, slug = "id" }) => {
  if (!row) return <></>;
  link = link?.replace("slug", row?.[slug].toString());
  const Node = link ? Link : Fragment;
  return (
    <div className="w-full">
      <Node href={link || ""} className={cn(link && "hover:underline")}>
        {children}
      </Node>
    </div>
  );
};
export function PrimaryCellContent({ children }) {
  return <div className="font-semibold">{children}</div>;
}
export function SecondaryCellContent({ children }) {
  return <div className="text-muted-foreground text-sm">{children}</div>;
}
