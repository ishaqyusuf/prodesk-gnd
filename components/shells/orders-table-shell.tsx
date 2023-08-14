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
  OrderStatus,
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction, PrintOrderMenuAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";

export default function OrdersTableShell<T>({
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
      {
        accessorKey: "_status",
        enableHiding: false,
      },
      {
        accessorKey: "_q",
        enableHiding: false,
      },
      {
        accessorKey: "_payment",
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
      SelectionAction={({ items }) => {
        console.log(items);
        return (
          <>
            {/* <span>{JSON.stringify(items)}</span> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Toggle columns"
                  variant="outline"
                  size="icon"
                  className="ml-auto hidden h-8 lg:flex"
                >
                  <Printer className=" h-4 w-4" />
                  {/* View */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <PrintOrderMenuAction
                  row={null as any}
                  slugs={items?.map((i) => i?.original?.slug)}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      }}
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
          title: "Payment",
          single: true,
          options: [
            { label: "Paid Fully", value: "Paid" },
            { label: "Part Paid", value: "Part" },
            { label: "Pending", value: "Pending" },
          ],
        },
        //  {
        //    id: "category",
        //    title: "Category",
        //    options: products.category.enumValues.map((category) => ({
        //      label: `${category.charAt(0).toUpperCase()}${category.slice(1)}`,
        //      value: category,
        //    })),
        //  },
      ]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "orderId, customer",
        },
      ]}
      newRowLink={`/sales/order/new/form`}
      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
