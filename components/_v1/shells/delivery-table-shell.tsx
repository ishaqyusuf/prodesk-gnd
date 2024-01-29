"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
    Cell,
    CheckColumn,
    ColumnHeader,
    PrimaryCellContent,
    _FilterColumn,
} from "../columns/base-columns";
import {
    OrderCustomerCell,
    OrderIdCell,
    OrderInvoiceCell,
    OrderMemoCell,
    OrderPriorityFlagCell,
    OrderProductionStatusCell,
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { DataTable2 } from "../data-table/data-table-2";

import { SalesCustomerFilter } from "../../../app/(v1)/(auth)/sales/orders/components/sales-customer-filter";
import { labelValue, truthy } from "@/lib/utils";
import { DeliveryStatusCell } from "../sales/delivery-status-cell";
import { DeliverySelectionAction } from "../list-selection-action/delivery-selection-action";
import {
    RowActionCell,
    RowActionMenuItem,
    RowActionMoreMenu,
} from "../data-table/data-table-row-actions";
import useQueryParams from "@/lib/use-query-params";

export default function DeliveryTableShell<T>({
    data,
    pageInfo,
    searchParams,
}: TableShellProps<ISalesOrder>) {
    const [isPending, startTransition] = useTransition();

    const { queryParams, setQueryParams } = useQueryParams<any>();
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
                cell: ({ row }) => OrderIdCell(row.original),
                header: ColumnHeader("Order"),
            },
            {
                accessorKey: "customer",
                header: ColumnHeader("Customer"),
                cell: ({ row }) => OrderCustomerCell(row.original.customer),
            },
            {
                accessorKey: "memo",
                header: ColumnHeader("Memo"),
                cell: ({ row }) => OrderMemoCell(row.original.shippingAddress),
            },
            ...truthy<any>(
                queryParams.get("_deliveryStatus") == "ready",
                [
                    {
                        accessorKey: "details",
                        header: ColumnHeader("Truck Details"),
                        cell: ({ row }) => (
                            <Cell>
                                <PrimaryCellContent>
                                    {row?.original?.meta?.truck}
                                </PrimaryCellContent>
                            </Cell>
                        ),
                    },
                ],
                [
                    {
                        accessorKey: "production",
                        header: ColumnHeader("Production"),
                        cell: ({ row }) =>
                            OrderProductionStatusCell(row.original),
                    },
                ]
            ),

            {
                accessorKey: "status",
                header: ColumnHeader("Delivery"),
                cell: ({ row }) => <DeliveryStatusCell order={row.original} />,
            },
            ..._FilterColumn("_status", "_customerId", "_deliveryStatus"),
            {
                accessorKey: "actions",
                header: ColumnHeader(""),
                size: 15,
                maxSize: 15,
                enableSorting: false,
                cell: ({ row }) => (
                    <>
                        <RowActionCell>
                            <RowActionMoreMenu>
                                <RowActionMenuItem>
                                    Ready For Delivery
                                </RowActionMenuItem>
                            </RowActionMoreMenu>
                        </RowActionCell>
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
            SelectionAction={DeliverySelectionAction}
            filterableColumns={[
                {
                    id: "_deliveryStatus",
                    title: "Status",
                    single: true,
                    options: [
                        labelValue("Pending Production", "pending production"),
                        labelValue("Queued for Delivery", "queued"),
                        labelValue("Ready For Delivery", "ready"),
                        labelValue("In Transit", "transit"),
                        labelValue("Delivered", "delivered"),
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
