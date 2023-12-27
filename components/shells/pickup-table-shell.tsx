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
    OrderMemoCell,
    OrderPriorityFlagCell,
    OrderProductionStatusCell,
    OrderStatus,
} from "../columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";

import { SalesSelectionAction } from "../list-selection-action/sales-selection-action";
import { SalesCustomerFilter } from "../../app/(auth)/sales/orders/components/sales-customer-filter";
import { labelValue } from "@/lib/utils";
import { DeliveryStatusCell } from "../sales/delivery-status-cell";
import { PickupStatusCell } from "../sales/pickup-status-cell";
import { PickupAction } from "../actions/pickup-action";

export default function PickupTableShell<T>({
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
            {
                accessorKey: "production",
                header: ColumnHeader("Production"),
                cell: ({ row }) => OrderProductionStatusCell(row.original),
            },
            {
                accessorKey: "status",
                header: ColumnHeader("Pickup"),
                cell: ({ row }) => <PickupStatusCell order={row.original} />,
            },
            ..._FilterColumn("_status", "_customerId", "_deliveryStatus"),
            {
                accessorKey: "actions",
                header: ColumnHeader(""),
                size: 15,
                maxSize: 15,
                enableSorting: false,
                cell: ({ row }) => (
                    <PickupAction item={row.original}></PickupAction>
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
            SelectionAction={SalesSelectionAction}
            filterableColumns={[
                {
                    id: "_deliveryStatus",
                    title: "Status",
                    single: true,
                    options: [
                        labelValue("Pending Production", "pending production"),
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
