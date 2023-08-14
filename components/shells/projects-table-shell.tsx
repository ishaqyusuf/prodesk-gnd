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
} from "../columns/base-columns";

import { OrderRowAction, PrintOrderMenuAction } from "../actions/order-actions";
import { DataTable2 } from "../data-table/data-table-2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { IProject } from "@/types/community";

export default function ProjectsTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IProject>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IProject, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        maxSize: 10,
        id: "refNo",
        header: ColumnHeader("Ref/Id"),
        cell: ({ row }) => (
          <Cell link="/community/projects/slug" slug={row.original.slug}>
            <PrimaryCellContent>{row.original.refNo}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
      },
      {
        header: ColumnHeader("Project"),
        id: "title",
        cell: ({ row }) => (
          <Cell link="/community/projects/slug" slug={row.original.slug}>
            <PrimaryCellContent>{row.original.title}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        accessorKey: "orderId",
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original?.meta?.supervisor?.name}
            </SecondaryCellContent>
          </Cell>
        ),
        header: ColumnHeader("Supervisor"),
      },
      {
        accessorKey: "customer",
        header: ColumnHeader("Units"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>
              {row.original._count?.homes}
            </PrimaryCellContent>
          </Cell>
        ),
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
