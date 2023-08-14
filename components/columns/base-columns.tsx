"use client";

import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Checkbox } from "../ui/checkbox";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDate } from "@/lib/use-day";

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
export const Cell = ({
  row,
  link,
  children,
  slug,
}: {
  row?;
  link?;
  children?;
  slug?;
}) => {
  // if (!row) return <></>;
  link = link?.replace("slug", slug?.toString());
  const Node = link && slug ? Link : Fragment;
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
export function DateCellContent({
  children,
  primary,
}: {
  children?;
  primary?: Boolean;
}) {
  const Node = primary ? PrimaryCellContent : SecondaryCellContent;
  const value = formatDate(children);
  return <Node>{value}</Node>;
}
