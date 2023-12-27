"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
    CheckColumn,
    ColumnHeader,
    DateCellContent,
    PrimaryCellContent,
    SecondaryCellContent,
    _FilterColumn,
} from "../../../../../components/columns/base-columns";
import { DataTable } from "../../../../../components/data-table/data-table";
import {
    OrderCustomerCell,
    OrderIdCell,
    OrderInvoiceCell,
    OrderMemoCell,
    OrderPriorityFlagCell,
    OrderProductionStatusCell,
    OrderStatus,
} from "../../../../../components/columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../../../../../components/actions/order-actions";
import { DataTable2 } from "../../../../../components/data-table/data-table-2";

import { SalesSelectionAction } from "../../../../../components/list-selection-action/sales-selection-action";
import { SalesCustomerFilter } from "./sales-customer-filter";
import { SmartTable } from "../../../../../components/data-table/smart-table";
import { useMediaQuery } from "react-responsive";
import { screens } from "@/lib/responsive";
import SalesOrderMobileCell from "../../../../../components/mobile/sales/sales-order-mobile-cell";
import { openModal } from "@/lib/modal";
import { Button } from "../../../../../components/ui/button";
import { DynamicFilter } from "@/components/data-table/data-table-dynamic-filter";
import { _getSalesRep } from "../_actions/get-sales-rep.action";
export default function OrdersTableShell<T>({
    data,
    pageInfo,
    searchParams,
}: TableShellProps<ISalesOrder>) {
    const [isPending, startTransition] = useTransition();

    // const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
    const table = SmartTable<ISalesOrder>(data);
    const isMobile = useMediaQuery(screens.xs);
    const columns = useMemo<ColumnDef<ISalesOrder, unknown>[]>(
        () =>
            isMobile
                ? [
                      {
                          id: "order",
                          cell: ({ row }) => (
                              <SalesOrderMobileCell order={row.original} />
                          ),
                      },
                      ..._FilterColumn(
                          "_status",
                          "_q",
                          "_payment",
                          "_customerId",
                          "_date"
                      ),
                  ]
                : [
                      table.checkColumn(),
                      // CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
                      {
                          id: "flag",
                          maxSize: 10,
                          // accessorKey: "flags",
                          cell: ({ row }) =>
                              OrderPriorityFlagCell(row.original, true),
                      },
                      // table.simpleColumn("Order", data => ({
                      //     link: `/sales/order/${data.slug}`,
                      //     story: [
                      //         table.primaryText(data.orderId),
                      //         table.secondary(data.createdAt)
                      //     ]
                      // })),
                      {
                          accessorKey: "orderId",
                          cell: ({ row }) =>
                              OrderIdCell(row.original, "/sales/order/slug"),
                          header: ColumnHeader("Order"),
                      },
                      {
                          accessorKey: "customer",
                          header: ColumnHeader("Customer"),
                          cell: ({ row }) =>
                              OrderCustomerCell(
                                  row.original.customer,
                                  "/sales/customer/slug"
                              ),
                      },
                      {
                          accessorKey: "memo",
                          header: ColumnHeader("Address"),
                          cell: ({ row }) =>
                              OrderMemoCell(row.original.shippingAddress),
                      },
                      table.simpleColumn("Rep", (data) => ({
                          story: [table.secondary(data.salesRep?.name)],
                      })),
                      {
                          accessorKey: "invoice",
                          header: ColumnHeader("Total/Due"),
                          cell: ({ row }) => (
                              <OrderInvoiceCell order={row.original} />
                          ),
                      },
                      {
                          accessorKey: "production",
                          header: ColumnHeader("Production"),
                          cell: ({ row }) =>
                              OrderProductionStatusCell(row.original),
                      },
                      {
                          accessorKey: "status",
                          header: ColumnHeader("Status"),
                          cell: ({ row }) => (
                              <OrderStatus order={row.original} />
                          ),
                      },
                      ..._FilterColumn(
                          "_status",
                          "_q",
                          "_payment",
                          "_customerId",
                          "_salesRepId",
                          "_date"
                      ),
                      {
                          // accessorKey: "actions",
                          id: "actions",
                          header: ColumnHeader(""),
                          size: 15,
                          maxSize: 15,
                          enableSorting: false,
                          cell: ({ row }) => (
                              <OrderRowAction row={row.original} />
                          ),
                      },
                  ],
        [data, isPending]
    );
    return (
        <>
            <DataTable2
                searchParams={searchParams}
                columns={columns}
                pageInfo={pageInfo}
                mobile
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
                            {
                                label: "Production Completed",
                                value: "Completed",
                            },
                            {
                                label: "Production Not Assigned",
                                value: "Unassigned",
                            },
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
                    ({ table }) => (
                        <DynamicFilter
                            table={table}
                            single
                            listKey="staticList"
                            labelKey="name"
                            valueKey="id"
                            title="Sales Rep"
                            columnId="_salesRepId"
                            loader={_getSalesRep}
                        />
                    ),
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
        </>
    );
}
