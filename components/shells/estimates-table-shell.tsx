"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
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
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import { SalesSelectionAction } from "../sales/sales-selection-action";
import { SalesCustomerFilter } from "../filters/sales-customer-filter";

export default function EstimatesTableShell<T>({
  data,
  pageInfo,
  searchParams,
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
        cell: ({ row }) =>
          OrderCustomerCell(row.original.customer, "/sales/customer/slug"),
      },
      {
        accessorKey: "invoice",
        header: ColumnHeader("Total"),
        cell: ({ row }) => <OrderInvoiceCell order={row.original} isEstimate />,
      },

      ..._FilterColumn("_q", "_status", "_date", "_customerId"),
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
    <DataTable2
      searchParams={searchParams}
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      SelectionAction={SalesSelectionAction}
      filterableColumns={[SalesCustomerFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "estimate id, customer...",
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
