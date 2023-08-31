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
  _FilterColumn,
} from "../columns/base-columns";

import { DataTable2 } from "../data-table/data-table-2";

import {
  DeleteRowAction,
  RowActionCell,
  RowActionMenuItem,
  RowActionMoreMenu,
} from "../data-table/data-table-row-actions";
import { deleteBuilderAction } from "@/app/_actions/community/builders";
import { Icons } from "../icons";
import { openModal } from "@/lib/modal";
import { IJobs } from "@/types/hrm";
import { CheckCheck, X } from "lucide-react";
import { toast } from "sonner";
import Money from "../money";
import { approveJob, rejectJob } from "@/app/_actions/hrm-jobs/job-actions";
import { labelValue, truthy } from "@/lib/utils";
import { ProjectsFilter } from "../filters/projects-filter";
import { BuilderFilter } from "../filters/builder-filter";
import { PayableEmployees } from "../filters/payable-employees-filter";

export default function JobTableShell<T>({
  data,
  pageInfo,
  payment,
  adminMode,
}: TableShellProps<IJobs> & {
  payment?: Boolean;
  adminMode?: Boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const columns = useMemo<ColumnDef<IJobs, unknown>[]>(
    () => [
      CheckColumn({ selectedRowIds, setSelectedRowIds, data }),
      {
        maxSize: 10,
        id: "id",
        header: ColumnHeader("#/Date"),
        cell: ({ row }) => (
          <Cell>
            <PrimaryCellContent>{row.original.id}</PrimaryCellContent>
            <DateCellContent>{row.original.createdAt}</DateCellContent>
          </Cell>
        ),
      },
      {
        id: "job",
        header: ColumnHeader("Job"),
        cell: ({ row }) => (
          <Cell
            className="cursor-pointer"
            onClick={() => openModal("jobOverview", row.original)}
          >
            <PrimaryCellContent>
              {row.original.title || "No Title"}
            </PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.subtitle || "No Description"}
            </SecondaryCellContent>
          </Cell>
        ),
      },
      ...(!payment && adminMode
        ? [
            {
              id: "user",
              header: ColumnHeader("Done By"),
              cell: ({ row }) => (
                <Cell>
                  <SecondaryCellContent>
                    {row.original.user.name}
                  </SecondaryCellContent>
                </Cell>
              ),
            },
            {
              id: "charges",
              header: ColumnHeader("Extra Charges"),
              cell: ({ row }) => (
                <Cell>
                  <SecondaryCellContent>
                    <Money value={row.original?.meta.additional_cost} />
                  </SecondaryCellContent>
                </Cell>
              ),
            },
          ]
        : []),
      {
        id: "total",
        header: ColumnHeader("Total"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>
              <Money value={row.original?.amount} />
            </SecondaryCellContent>
          </Cell>
        ),
      },
      {
        id: "status",
        header: ColumnHeader("Status"),
        cell: ({ row }) => (
          <Cell>
            <SecondaryCellContent>{row.original.status}</SecondaryCellContent>
            <DateCellContent>{row.original.statusDate}</DateCellContent>
          </Cell>
        ),
      },
      ...truthy<any>(
        payment,
        [],
        [
          {
            accessorKey: "actions",
            header: ColumnHeader(""),
            size: 15,
            maxSize: 15,
            enableSorting: false,
            cell: ({ row }) => (
              <RowActionCell>
                <DeleteRowAction
                  row={row.original}
                  action={deleteBuilderAction}
                />
                <RowActionMoreMenu>
                  <RowActionMenuItem
                    onClick={() => {
                      openModal("editJob", row.original);
                    }}
                    Icon={Icons.edit}
                  >
                    Edit
                  </RowActionMenuItem>
                  {!row.original.approvedAt && (
                    <RowActionMenuItem
                      onClick={async () => {
                        await approveJob(row.original?.id);
                        toast.success("Job Approved");
                      }}
                      Icon={CheckCheck}
                    >
                      Approve Job
                    </RowActionMenuItem>
                  )}
                  {!row.original.rejectedAt && (
                    <RowActionMenuItem
                      onClick={async () => {
                        await rejectJob(row.original?.id);
                        toast.success("Job Rejected");
                      }}
                      Icon={X}
                    >
                      Reject Job
                    </RowActionMenuItem>
                  )}
                  <DeleteRowAction
                    menu
                    row={row.original}
                    action={deleteBuilderAction}
                  />
                </RowActionMoreMenu>
              </RowActionCell>
            ),
          },
        ]
      ),
      ..._FilterColumn("_projectId", "_q", "_userId", "_show", "_builderId"),
    ], //.filter(Boolean) as any,
    [data, isPending]
  );
  return (
    <DataTable2
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={[
        {
          id: "_show",
          title: "Show",
          single: true,
          options: [
            labelValue("Approved", "approved"),
            labelValue("Pending Approved", "submitted"),
            labelValue("Paid", "paid"),
            labelValue("Pending Payment", "unpaid"),
          ],
        },
        adminMode && ProjectsFilter,
        adminMode && PayableEmployees,
      ].filter(Boolean)}
      searchableColumns={[
        {
          id: "_q" as any,
          title: "job, description",
        },
      ]}

      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
