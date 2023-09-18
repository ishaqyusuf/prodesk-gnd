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
import Btn from "../btn";
import { CheckCircle } from "lucide-react";
import PutawayActions from "../actions/putaway-actions";

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
      table.simpleColumn(
        "Item",
        (data) => ({
          story: [
            // table.primaryText(data.salesOrderItems?.description)
            <table.Primary className="line-clamp-2" key={1}>
              {data.salesOrderItems?.description}
            </table.Primary>,
          ],
        }),
        { maxSize: 50 }
      ),
      table.simpleColumn("Qty", (data) => ({
        story: [table.primaryText(data.qty)],
      })),
      table.simpleStatus("status"),
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => <PutawayActions data={row.original} />,
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
          id: "Status",
          title: "Status",
          single: true,
          options: [
            { label: "Started", value: "Started" },
            { label: "Queued", value: "Queued" },
            { label: "Completed", value: "Completed" },
            { label: "Late", value: "Late" },
          ],
        },
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
