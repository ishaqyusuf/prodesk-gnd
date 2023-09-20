"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CheckColumn,
  ColumnHeader,
  _FilterColumn,
} from "../columns/base-columns";
import { DataTable } from "../data-table/data-table";
import {
  OrderCustomerCell,
  OrderIdCell,
  OrderInvoiceCell,
  OrderMemoCell,
  OrderPriorityFlagCell,
  OrderProductionStatusCell,
  OrderStatus,
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";

import { SalesSelectionAction } from "../sales/sales-selection-action";
import { SalesCustomerFilter } from "../filters/sales-customer-filter";

export default function OrdersTableShell<T>({
  data,
  pageInfo,
  searchParams,
}: TableShellProps<ISalesOrder>) {
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    console.log("ORDERS", data);
  }, [data]);
  console.log(data);
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
        cell: ({ row }) => OrderIdCell(row.original, "/sales/order/slug"),
        header: ColumnHeader("Order"),
      },
      {
        accessorKey: "customer",
        header: ColumnHeader("Customer"),
        cell: ({ row }) =>
          OrderCustomerCell(row.original.customer, "/sales/customer/slug"),
      },
      {
        accessorKey: "memo",
        header: ColumnHeader("Memo"),
        cell: ({ row }) => OrderMemoCell(row.original.shippingAddress),
      },
      {
        accessorKey: "invoice",
        header: ColumnHeader("Total/Due"),
        cell: ({ row }) => <OrderInvoiceCell order={row.original} />,
      },
      {
        accessorKey: "production",
        header: ColumnHeader("Production"),
        cell: ({ row }) => OrderProductionStatusCell(row.original),
      },
      {
        accessorKey: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => OrderStatus(row.original),
      },
      ..._FilterColumn("_status", "_q", "_payment", "_customerId", "_date"),
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
      searchParams={searchParams}
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      SelectionAction={SalesSelectionAction}
      filterableColumns={[
        {
          id: "status",
          title: "Status",
          single: true,
          options: [
            { label: "Production Started", value: "Started" },
            { label: "Production Assigned", value: "Queued" },
            { label: "Production Completed", value: "Completed" },
            { label: "Production Not Assigned", value: "Unassigned" },
          ],
        },
        {
          id: "_payment" as any,
          title: "Invoice",
          single: true,
          options: [
            { label: "Paid", value: "Paid" },
            // { label: "Part Paid", value: "Part" },
            { label: "Pending", value: "Pending" },
          ],
        },
        SalesCustomerFilter,
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
        },
      ]}
    />
  );
}
