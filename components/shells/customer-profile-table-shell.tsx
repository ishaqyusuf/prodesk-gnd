"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState, useTransition } from "react";
import {
  ColumnHeader,
  Cell,
  PrimaryCellContent,
  SecondaryCellContent,
} from "../columns/base-columns";

import { DataTable2 } from "../data-table/data-table-2";

import { BuilderFilter } from "../filters/builder-filter";

import {
  DeleteRowAction,
  RowActionCell,
} from "../data-table/data-table-row-actions";

import { CustomerTypes } from "@prisma/client";
import {
  deleteCustomerProfile,
  makeDefaultCustomerProfile,
} from "@/app/_actions/sales/sales-customer-profiles";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Btn from "../btn";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CustomerProfileTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<CustomerTypes>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<CustomerTypes, unknown>[]>(
    () => [
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("#"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.id}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        id: "title",
        header: ColumnHeader("Profile Name"),
        cell: ({ row }) => (
          <Cell>
            {/* link={`/community/project/slug`} slug={row.original.slug} */}
            <PrimaryCellContent>{row.original.title}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        id: "discount",
        header: ColumnHeader("Sales Margin"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original.coefficient || 0}
            </SecondaryCellContent>
          </Cell>
        ),
      },

      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionCell>
            <DefaultActionCell row={row.original} />
            <DeleteRowAction
              row={row.original}
              action={deleteCustomerProfile}
            />
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
      filterableColumns={[BuilderFilter]}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "title, builder",
        },
      ]}

      //  deleteRowsAction={() => void deleteCustomerProfile()}
    />
  );
}
function DefaultActionCell({ row }) {
  const [isLoading, startTransition] = useTransition();
  const route = useRouter();
  async function makeDefault() {
    startTransition(async () => {
      await makeDefaultCustomerProfile(row.id);
      toast.success("Profile set successfully.");
      route.refresh();
    });
  }
  return (
    <SecondaryCellContent>
      {row.defaultProfile ? (
        <Badge>Default</Badge>
      ) : (
        <Btn
          isLoading={isLoading}
          onClick={makeDefault}
          variant="secondary"
          className="flex h-8"
        >
          <span className="whitespace-nowrap">{"Set Default"}</span>
        </Btn>
      )}
    </SecondaryCellContent>
  );
}
