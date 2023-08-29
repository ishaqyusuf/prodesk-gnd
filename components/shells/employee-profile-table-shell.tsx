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
import { IUser } from "@/types/hrm";
import { Key } from "lucide-react";
import { resetEmployeePassword } from "@/app/_actions/hrm/save-employee";
import { toast } from "sonner";
import { EmployeeProfile } from "@prisma/client";

export default function EmployeeProfileTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<EmployeeProfile>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<EmployeeProfile, unknown>[]>(
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
            <PrimaryCellContent>{row.original.name}</PrimaryCellContent>
          </Cell>
        ),
      },
      {
        id: "discount",
        header: ColumnHeader("Discount"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original.discount || 0}%{" "}
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
            <DeleteRowAction row={row.original} action={deleteBuilderAction} />
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

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
