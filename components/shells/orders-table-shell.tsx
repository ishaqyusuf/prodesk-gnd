"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import { CheckColumn, ColumnHeader } from "../columns/base-columns";
import { DataTable } from "../data-table/data-table";
import { OrderIdCell, OrderPriorityFlagColumn } from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";

export default function OrdersTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<ISalesOrder>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ISalesOrder, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      OrderPriorityFlagColumn(true),
      {
        accessorKey: "orderId",
        cell: ({ row }) => OrderIdCell(row.original, "/sales/orders/slug"),
        header: ColumnHeader("Order"),
      },
    ],
    [data, isPending]
  );
  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={5}
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
      searchableColumns={
        [
          //  {
          //    id: "name",
          //    title: "names",
          //  },
        ]
      }
      newRowLink={`/sales/orders`}
      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
