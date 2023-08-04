"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import { CheckColumn, ColumnHeader } from "../columns/base-columns";
import { DataTable } from "../data-table/data-table";
import {
  OrderCustomerCell,
  OrderIdCell,
  OrderInvoiceCell,
  OrderMemoCell,
  OrderPriorityFlagCell,
  OrderProductionStatusCell,
  ProdOrderCell,
  ProdStatusCell,
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../actions/order-actions";
import { formatDate } from "@/lib/use-day";
import { DataTable2 } from "../data-table/data-table-2";

export default function SalesProductionTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<ISalesOrder>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ISalesOrder, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        maxSize: 10,
        id: "flags",
        cell: ({ row }) => OrderPriorityFlagCell(row.original, true),
      },
      {
        accessorKey: "orderId",
        cell: ({ row }) =>
          ProdOrderCell(row.original, "/sales/production/slug"),
        header: ColumnHeader("Order"),
      },
      {
        accessorKey: "salesRep",
        header: ColumnHeader("Sales Rep"),
        cell: ({ row }) => {
          return (
            <>
              <p>{row.original.salesRep?.name}</p>
            </>
          );
        },
      },

      {
        accessorKey: "dueDate",
        header: ColumnHeader("Due Date"),
        cell: ({ row }) => {
          return (
            <>
              <p>{formatDate(row.original.prodDueDate)}</p>
            </>
          );
        },
      },
      {
        accessorKey: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => <ProdStatusCell order={row.original} />,
      },
      {
        accessorKey: "_status",
        enableHiding: false,
      },
      {
        accessorKey: "_q",
        enableHiding: false,
      },
      {
        accessorKey: "_dateType",
        enableHiding: false,
      },
      {
        accessorKey: "_date",
        enableHiding: false,
      },
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => <OrderRowAction row={row.original} />,
      },
    ],
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
          options: [
            { label: "Started", value: "Started" },
            { label: "Queued", value: "Queued" },
            { label: "Completed", value: "Completed" },
          ],
        },
      ]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "orderId, customer",
        },
      ]}
      dateFilterColumns={[
        {
          id: "_date" as any,
          title: "Date",
          rangeSwitch: true,
          filter: {
            single: true,
            title: "Type",
            id: "_dateType" as any,
            options: [
              { label: "Due Date", value: "prodDueDate" },
              { label: "Order Date", value: "createdAt" },
            ],
          },
        },
      ]}
      newRowLink={`/sales/order/new/form`}
      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
