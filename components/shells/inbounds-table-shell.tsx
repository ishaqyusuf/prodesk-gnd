"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  ColumnHeader,
  Cell,
  PrimaryCellContent,
  SecondaryCellContent,
  DateCellContent,
} from "../columns/base-columns";
import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";
import {
  DeleteRowAction,
  RowActionCell,
} from "../data-table/data-table-row-actions";

import { EmployeeProfile } from "@prisma/client";
import { deleteEmployeeProfile } from "@/app/_actions/hrm/employee-profiles";
import { IInboundOrder } from "@/types/sales-inbound";
import StatusBadge from "../status-badge";
import { Badge } from "../ui/badge";

export default function InboundsTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IInboundOrder>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IInboundOrder, unknown>[]>(
    () => [
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("Date"),
        cell: ({ row }) => (
          <Cell>
            <DateCellContent>{row.original.status}</DateCellContent>
          </Cell>
        ),
      },
      {
        id: "title",
        header: ColumnHeader("Order #"),
        cell: ({ row }) => (
          <Cell>
            {/* link={`/community/project/slug`} slug={row.original.slug} */}
            <PrimaryCellContent>{row.original.orderId}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        id: "putaway",
        header: ColumnHeader("Putaway"),
        cell: ({ row }) => (
          <Cell
            link={`/sales/inbounds/putaway?orderId=${row.original.orderId}`}
          >
            <Badge>
              {row.original.inboundItems.filter((i) => i?.putawayAt)?.length}
              {"/"}
              {row.original.inboundItems.length}
            </Badge>
          </Cell>
        ),
      },
      {
        id: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => (
          <Cell>
            <StatusBadge>{row.original.status}</StatusBadge>
          </Cell>
        ),
      },

      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionCell>
            <DeleteRowAction
              row={row.original}
              action={deleteEmployeeProfile}
            />
          </RowActionCell>
        ),
      },
    ], //.filter(Boolean) as any,
    [data, isPending]
  );
  return (
    <DataTable2
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={[BuilderFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
