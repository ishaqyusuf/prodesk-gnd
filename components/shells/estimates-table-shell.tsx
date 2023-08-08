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
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../actions/order-actions";

export default function EstimatesTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<ISalesOrder>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ISalesOrder, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),

      {
        accessorKey: "orderId",
        cell: ({ row }) => OrderIdCell(row.original, "/sales/estimate/slug"),
        header: ColumnHeader("Estimate #"),
      },
      {
        accessorKey: "customer",
        header: ColumnHeader("Customer"),
        cell: ({ row }) => OrderCustomerCell(row.original.customer),
      },
      {
        accessorKey: "invoice",
        header: ColumnHeader("Total"),
        cell: ({ row }) => OrderInvoiceCell(row.original, true),
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
        accessorKey: "_priority",
        enableHiding: false,
      },
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => <OrderRowAction estimate row={row.original} />,
      },
    ],
    [data, isPending]
  );
  return (
    <DataTable
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={
        [
          //  {
          //    id: "category",
          //    title: "Category",
          //    options: products.category.enumValues.map((category) => ({
          //      label: `${category.charAt(0).toUpperCase()}${category.slice(1)}`,
          //      value: category,
          //    })),
          //  },
        ]
      }
      searchableColumns={[
        {
          id: "_q" as any,
          title: "orderId, customer",
        },
      ]}
      newRowLink={`/sales/estimate/new/form`}
      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
