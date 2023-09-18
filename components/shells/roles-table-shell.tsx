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
  EditRowAction,
  RowActionCell,
} from "../data-table/data-table-row-actions";

import { EmployeeProfile, Roles } from "@prisma/client";
import { deleteEmployeeProfile } from "@/app/_actions/hrm/employee-profiles";
import { SmartTable } from "../data-table/smart-table";
import { openModal } from "@/lib/modal";

export default function RolesTableShell({
  data,
  pageInfo,
}: TableShellProps<Roles>) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const table = SmartTable<Roles>(data);
  const columns = useMemo<ColumnDef<Roles, unknown>[]>(
    () => [
      table.simpleColumn("#", (data) => ({
        story: [table.primaryText(data.id), table.secondary(data.createdAt)],
      })),

      {
        id: "title",
        header: ColumnHeader("Role"),
        cell: ({ row }) => (
          <Cell>
            {/* link={`/community/project/slug`} slug={row.original.slug} */}
            <PrimaryCellContent>{row.original.name}</PrimaryCellContent>
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
            <EditRowAction
              onClick={(e) => {
                openModal("role", row.original);
              }}
            />
            <DeleteRowAction
              row={row.original}
              action={deleteEmployeeProfile}
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
          title: "",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
