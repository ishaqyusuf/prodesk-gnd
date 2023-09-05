"use client";

import { TableShellProps } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import { Icons } from "../icons";
import { openModal } from "@/lib/modal";
import { IUser } from "@/types/hrm";
import { Key } from "lucide-react";
import { resetEmployeePassword } from "@/app/_actions/hrm/save-employee";
import { toast } from "sonner";
import { loadStaticList } from "@/store/slicers";
import { useAppSelector } from "@/store";
import {
  setEmployeeProfileAction,
  getStaticEmployeeProfiles,
} from "@/app/_actions/hrm/employee-profiles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { RolesFilter } from "../filters/roles-filter";

export default function EmployeesTableShell<T>({
  data,
  pageInfo,
}: TableShellProps<IUser>) {
  const [isPending, startTransition] = useTransition();
  const profiles = useAppSelector(
    (state) => state?.slicers?.staticEmployeeProfiles
  );
  useEffect(() => {
    loadStaticList(
      "staticEmployeeProfiles",
      profiles,
      getStaticEmployeeProfiles
    );
  }, []);
  const route = useRouter();
  async function setEmployeeProfile(employeeId, profile) {
    await setEmployeeProfileAction(employeeId, profile.id);
    toast.success("Profile set successfully.");
    route.refresh();
  }
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IUser, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
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
        header: ColumnHeader("Name"),
        cell: ({ row }) => (
          <Cell>
            {/* link={`/community/project/slug`} slug={row.original.slug} */}
            <PrimaryCellContent>{row.original.name}</PrimaryCellContent>
            <SecondaryCellContent>{row.original.username}</SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "role",
        header: ColumnHeader("Role"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              {row.original.role?.name}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "role",
        header: ColumnHeader("Profile"),
        cell: ({ row }) => (
          <Cell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  className="flex h-8  data-[state=open]:bg-muted"
                >
                  <span className="whitespace-nowrap">
                    {row.original.employeeProfile?.name || "Select Profile"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[185px]">
                {profiles?.map((profile) => (
                  <DropdownMenuItem
                    onClick={() => setEmployeeProfile(row.original.id, profile)}
                    key={profile.id}
                  >
                    {profile.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </Cell>
        ),
      },

      ..._FilterColumn("_q", "_roleId"),
      {
        accessorKey: "actions",
        header: ColumnHeader(""),
        size: 15,
        maxSize: 15,
        enableSorting: false,
        cell: ({ row }) => (
          <RowActionCell>
            {/* <DeleteRowAction row={row.original} action={} /> */}
            <RowActionMoreMenu>
              <RowActionMenuItem
                onClick={() => {
                  openModal("employee", row.original);
                }}
                Icon={Icons.edit}
              >
                Edit
              </RowActionMenuItem>
              <RowActionMenuItem
                onClick={async () => {
                  await resetEmployeePassword(row.original?.id);
                  toast.success("Password reset successfully!");
                }}
                Icon={Key}
              >
                Reset Password
              </RowActionMenuItem>
              {/* <DeleteRowAction
                menu
                row={row.original}
                action={}
              /> */}
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
      filterableColumns={[BuilderFilter, RolesFilter]}
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
