"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  ColumnHeader,
  Cell,
  PrimaryCellContent,
  DateCellContent,
} from "../columns/base-columns";
import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";
import {
  DeleteRowAction,
  RowActionCell,
} from "../data-table/data-table-row-actions";

import { deleteEmployeeProfile } from "@/app/_actions/hrm/employee-profiles";
import { IInboundOrderItems } from "@/types/sales-inbound";
import { SmartTable } from "../data-table/smart-table";
import { InboundStatus } from "@/lib/status";
import { labelValue } from "@/lib/utils";

export default function PutawayTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IInboundOrderItems>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const table = SmartTable<IInboundOrderItems>(data);
  // const _columns = table.Columns([
  //   table.column("id", "#", {
  //     content: (data) => ({
  //       link: ``,
  //       story: [
  //         table.primaryText(data.InboundOrder?.orderId),
  //         table.secondary(data.createdAt),
  //       ],
  //     }),
  //   }),
  // ]);
  const columns = useMemo<ColumnDef<IInboundOrderItems, unknown>[]>(
    () => [
      table.column("id", "#", {
        maxSize: 10,
        content(data) {
          return {
            story: [
              table.primaryText(data.InboundOrder?.orderId),
              table.secondary(data.createdAt),
            ],
          };
        },
      }),
      table.simpleColumn("Item", (data) => ({
        story: [table.primaryText(data.salesOrderItems?.description)],
      })),
      table.simpleColumn("Qty", (data) => ({
        story: [table.primaryText(data.qty)],
      })),
      table.simpleColumn("Status", (data) => ({
        story: [table.status(data.status)],
      })),

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
      filterableColumns={[
        {
          id: "status",
          title: "Status",
          single: true,
          options: [
            { label: "Started", value: "Started" },
            { label: "Queued", value: "Queued" },
            { label: "Completed", value: "Completed" },
            { label: "Late", value: "Late" },
          ],
        },
        // {
        //   id: "status",
        //   title: "status",
        //   single: true,
        //   options: [...InboundStatus, "Stocked"].map((value) =>
        //     labelValue(value, value)
        //   ),
        // },
      ]}
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
