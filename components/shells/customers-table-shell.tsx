"use client";

import { TableShellProps } from "@/types/data-table";
// import { ISalesOrder } from "@/types/ISales";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  CheckColumn,
  ColumnHeader,
  LinkCell,
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";

import { PrintOrderMenuAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { ICustomer } from "@/types/customers";

export default function CustomersTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<ICustomer>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<ICustomer, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),

      {
        accessorKey: "customer",
        header: ColumnHeader("Customer"),
        cell: ({ row }) => (
          <LinkCell
            row={row.original}
            slug={row.original.id}
            link="/sales/customer/slug"
          >
            <PrimaryCellContent>{row.original.name}</PrimaryCellContent>
            <SecondaryCellContent>{row.original.phoneNo}</SecondaryCellContent>
          </LinkCell>
        ),
      },

      {
        accessorKey: "orders",
        header: ColumnHeader("Orders"),
        cell: ({ row }) => <>{row.original?._count?.salesOrders}</>,
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
        // cell: ({ row }) => <OrderRowAction row={row.original} />,
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
      filterableColumns={[]}
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
