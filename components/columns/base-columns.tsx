"use client";

import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { Checkbox } from "../ui/checkbox";
import { Fragment, useTransition } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDate } from "@/lib/use-day";
import { typedMemo } from "@/lib/hocs/typed-memo";
import { useRouter } from "next/navigation";
import { useBool } from "@/lib/use-loader";
import { toast } from "sonner";
import { Icons } from "../icons";
import { DropdownMenuItem, DropdownMenuShortcut } from "../ui/dropdown-menu";
import { Info, Trash } from "lucide-react";
import LinkableNode from "../link-node";
import { PrimitiveDivProps } from "@radix-ui/react-tabs";
import { Badge } from "../ui/badge";
import { getBadgeColor } from "@/lib/status-badge";

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
  className,
  ...mainProps
}: {
  row?;
  link?;
  children?;
  slug?;
  className?;
  onClick?;
}) => {
  // if (!row) return <></>;
  link = link?.replace("slug", slug?.toString());

  return (
    <div {...mainProps} className={cn("w-full", className)}>
      <LinkableNode href={link || ""} className={cn(link && "hover:underline")}>
        {children}
      </LinkableNode>
    </div>
  );
};
export function PrimaryCellContent({
  children,
  className,
  ...props
}: PrimitiveDivProps) {
  return (
    <div {...props} className={cn("font-semibold", className)}>
      {children}
    </div>
  );
}
export function SecondaryCellContent({
  children,
  className,
  ...props
}: PrimitiveDivProps) {
  return (
    <div {...props} className={cn("text-muted-foreground text-sm", className)}>
      {children}
    </div>
  );
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

type FilterKeys =
  | "_q"
  | "_projectId"
  | "_status"
  | "_payment"
  | "_userId"
  | "_builderId"
  | "_customerId"
  | "_roleId"
  | "_date"
  | "_installation"
  | "_production"
  | "_supplier"
  | "_category"
  | "_show";
export function _FilterColumn(...assessorKeys: FilterKeys[]) {
  const filters = assessorKeys.map((accessorKey) => ({
    accessorKey,
    enableHiding: false,
  }));

  return filters;
}
export function StatusCell({ status }) {
  const color = getBadgeColor(status);
  return (
    <div className="w-16">
      <Badge
        variant={"secondary"}
        className={`h-5 px-1 whitespace-nowrap  text-xs text-slate-100 ${color}`}
      >
        {/* {order?.prodStatus || "-"} */}
        {status || "no status"}
      </Badge>
    </div>
  );
}
