"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  CheckColumn,
  ColumnHeader,
  Cell,
  PrimaryCellContent,
  DateCellContent,
  SecondaryCellContent,
  _FilterColumn,
} from "../columns/base-columns";

import { OrderRowAction, PrintOrderMenuAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";
import { HomeProductionStatus } from "../columns/community-columns";
import { IBuilder, IProject } from "@/types/community";
import {
  DeleteRowAction,
  RowActionCell,
  RowActionMenuItem,
  RowActionMoreMenu,
} from "../data-table/data-table-row-actions";
import { deleteBuilderAction } from "@/app/_actions/community/builders";
import { Icons } from "../icons";
import { openModal } from "@/lib/modal";
import { IInboundOrderItems } from "@/types/sales-inbound";
import { ISalesOrderItem } from "@/types/sales";
import { OrderCustomerCell, OrderInvoiceCell } from "../columns/sales-columns";
import StatusBadge from "../status-badge";

export default function InboundFormTableShell<T>({
  data,
  pageInfo,
  suppliers,
}: TableShellProps<ISalesOrderItem> & { suppliers: string[] }) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ISalesOrderItem, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        id: "title",
        header: ColumnHeader("Item"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.description}</PrimaryCellContent>
            <SecondaryCellContent>
              {row.original?.salesOrder?.orderId}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "customer",
        header: ColumnHeader("Customer"),
        cell: ({ row }) => OrderCustomerCell(row.original.salesOrder.customer),
      },
      {
        id: "supplier",
        header: ColumnHeader("Supplier"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>{row.original.supplier}</SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "qty",
        header: ColumnHeader("Qty"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.qty}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "invoice",
        header: ColumnHeader("Invoice"),
        cell: ({ row }) => {
          const order = row.original.salesOrder;
          const { amountDue = 0, grandTotal = 0 } = order;
          const status =
            amountDue == grandTotal
              ? "Pending"
              : (amountDue || 0) < (grandTotal || 0)
              ? "Part Paid"
              : "Paid";
          return (
            <Cell>
              <StatusBadge>{status}</StatusBadge>
            </Cell>
          );
        },
      },
      ..._FilterColumn("_q", "_supplier"),
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionCell>
            <DeleteRowAction row={row.original} action={deleteBuilderAction} />
            <RowActionMoreMenu>
              <RowActionMenuItem
                SubMenu={
                  <>
                    <RowActionMenuItem
                      onClick={() => {
                        openModal("builder", {
                          type: "main",
                          data: row.original,
                        });
                      }}
                      Icon={Icons.edit}
                    >
                      Info
                    </RowActionMenuItem>
                    <RowActionMenuItem
                      onClick={() => {
                        openModal("builder", {
                          type: "tasks",
                          data: row.original,
                        });
                      }}
                      Icon={Icons.edit}
                    >
                      Tasks
                    </RowActionMenuItem>
                    {/* <RowActionMenuItem
                      onClick={() => {
                        openModal("builder", {
                          type: "installations",
                          data: row.original,
                        });
                      }}
                      Icon={Icons.edit}
                    >
                      Tasks
                    </RowActionMenuItem> */}
                  </>
                }
                Icon={Icons.edit}
              >
                Edit
              </RowActionMenuItem>
              <DeleteRowAction
                menu
                row={row.original}
                action={deleteBuilderAction}
              />
            </RowActionMoreMenu>
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
          id: "_supplier",
          title: "Supplier",
          single: true,
          options: suppliers?.map((label) => ({ label, value: label })),
        },
      ]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "title, builder",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
