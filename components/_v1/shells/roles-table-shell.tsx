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

import { deleteEmployeeProfile } from "@/app/(v1)/_actions/hrm/employee-profiles";
import { SmartTable } from "../data-table/smart-table";
import { openModal } from "@/lib/modal";
import { IRole } from "@/types/hrm";

export default function RolesTableShell({
    data,
    pageInfo,
    searchParams,
}: TableShellProps<IRole>) {
    const [isPending, startTransition] = useTransition();

    const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
    const table = SmartTable<IRole>(data);
    const columns = useMemo<ColumnDef<IRole, unknown>[]>(
        () => [
            table.simpleColumn("#", (data) => ({
                story: [
                    table.primaryText(data.id),
                    table.secondary(data.createdAt),
                ],
            })),
            {
                id: "title",
                header: ColumnHeader("Role"),
                cell: ({ row }) => (
                    <Cell>
                        {/* link={`/community/project/slug`} slug={row.original.slug} */}
                        <PrimaryCellContent>
                            {row.original.name}
                        </PrimaryCellContent>
                    </Cell>
                ),
            },
            table.simpleColumn("Permissions", (data) => ({
                story: [
                    table.status(
                        `${data._count?.RoleHasPermissions} Permissions`
                    ),
                ],
            })),
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
            searchParams={searchParams}
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
