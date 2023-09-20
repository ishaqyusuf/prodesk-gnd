"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  Cell,
  CheckColumn,
  ColumnHeader,
  DateCellContent,
  PrimaryCellContent,
  SecondaryCellContent,
  _FilterColumn,
} from "../columns/base-columns";
import { DataTable } from "../data-table/data-table";
import {
  OrderCustomerCell,
  OrderIdCell,
  OrderInvoiceCell,
} from "../columns/sales-columns";
import { ISalesOrder, ISalesPayment } from "@/types/sales";
import { OrderRowAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import { SalesSelectionAction } from "../sales/sales-selection-action";
import { SalesCustomerFilter } from "../filters/sales-customer-filter";
import Money from "../money";
import { DeleteRowAction } from "../data-table/data-table-row-actions";
import { deleteSalesPayment } from "@/app/_actions/sales/sales-payment";
import { openModal } from "@/lib/modal";

export default function SalesPaymentTableShell({
  data,
  pageInfo,
  searchParams,
}: TableShellProps<ISalesPayment>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ISalesPayment, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        accessorKey: "id",
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.id}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
        header: ColumnHeader("#"),
      },
      {
        accessorKey: "customer",
        header: ColumnHeader("Customer"),
        cell: ({ row }) =>
          OrderCustomerCell(
            row.original.customer as any,
            "/sales/customer/slug"
          ),
      },
      {
        accessorKey: "order",
        header: ColumnHeader("Order"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original.order.orderId}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "invoice",
        header: ColumnHeader("Invoice"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              <Money value={row.original.amount} />
            </PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.meta.checkNo}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      ..._FilterColumn("_q", "_status", "_date", "_customerId"),
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <>
            <DeleteRowAction
              row={row}
              noRefresh
              noToast
              action={async (id) => {
                openModal("deletePaymentPrompt", row.original);
              }}
            />
          </>
        ),
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
      filterableColumns={[SalesCustomerFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "",
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
