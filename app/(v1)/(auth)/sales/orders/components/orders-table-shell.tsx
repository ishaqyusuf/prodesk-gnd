"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useTransition } from "react";
import {
    ColumnHeader,
    DateCellContent,
    _FilterColumn,
} from "../../../../../../components/_v1/columns/base-columns";

import {
    OrderIdCell,
    OrderInvoiceCell,
    OrderMemoCell,
    OrderPriorityFlagCell,
    OrderProductionStatusCell,
    OrderStatus,
    SalesCustomerCell,
} from "../../../../../../components/_v1/columns/sales-columns";
import { ISalesOrder } from "@/types/sales";
import { OrderRowAction } from "../../../../../../components/_v1/actions/order-actions";
import { DataTable2 } from "../../../../../../components/_v1/data-table/data-table-2";

import { SalesBatchAction } from "../../../../../../components/_v1/list-selection-action/sales-selection-action";
import { SalesCustomerFilter } from "./sales-customer-filter";
import { SmartTable } from "../../../../../../components/_v1/data-table/smart-table";
import { useMediaQuery } from "react-responsive";
import { screens } from "@/lib/responsive";
import SalesOrderMobileCell from "../../../../../../components/_v1/mobile/sales/sales-order-mobile-cell";
import { DynamicFilter } from "@/components/_v1/data-table/data-table-dynamic-filter";
import { _getSalesRep } from "../_actions/get-sales-rep.action";
import StatusBadge from "@/components/_v1/status-badge";
import { getSalesOrder } from "@/app/(v1)/_actions/sales/sales";
import DeliveryCell from "./cells/delivery-cell";

export type SalesTableItem = Awaited<
    ReturnType<typeof getSalesOrder>
>["data"][0];
export interface SalesCellProps {
    item: SalesTableItem;
}
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
                          cell: ({ row }) => (
                              <SalesCustomerCell order={row.original} />
                          ),
                          //   OrderCustomerCell(
                          //       row.original.customer,
                          //       "/sales/customer/slug",
                          //       row.original.shippingAddress?.phoneNo
                          //   ),
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
                          accessorKey: "delivery",
                          header: ColumnHeader("Delivery"),
                          cell: ({ row }) => (
                              <DeliveryCell item={row.original as any} />
                          ),
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
                          position: "sticky",
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
                BatchAction={SalesBatchAction}
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
