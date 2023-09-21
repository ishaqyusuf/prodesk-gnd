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
import { Icons } from "../icons";
import { openModal } from "@/lib/modal";
import { IJobs } from "@/types/hrm";
import { CheckCheck, Unlink, X } from "lucide-react";
import { toast } from "sonner";
import Money from "../money";
import { approveJob, rejectJob } from "@/app/_actions/hrm-jobs/job-actions";
import { labelValue, truthy } from "@/lib/utils";
import { ProjectsFilter } from "../filters/projects-filter";
import { PayableEmployees } from "../filters/employee-filter";
import { deleteJobAction } from "@/app/_actions/hrm-jobs/delete-job";
import { Badge } from "../ui/badge";

export default function JobTableShell<T>({
  data,
  pageInfo,
  searchParams,
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
            <PrimaryCellContent>{row.original.title || "-"}</PrimaryCellContent>
            <SecondaryCellContent>
              {row.original.subtitle || row.original.description || ""}
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
                    {row.original.user.name}{" "}
                    {row.original.coWorkerId && (
                      <>
                        <Badge className="leading-none bg-accent text-accent-foreground hover:bg-accent">
                          joint task
                        </Badge>
                      </>
                    )}
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
                  {/* <SecondaryCellContent className="line-clamp-1">
                    {row.original?.description}
                  </SecondaryCellContent> */}
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
                  action={deleteJobAction}
                  disabled={row.original.paymentId > 0}
                />
                <RowActionMoreMenu>
                  <RowActionMenuItem
                    onClick={() => {
                      openModal("submitJob", {
                        data: row.original,
                        defaultTab: "tasks",
                      });
                    }}
                    Icon={Icons.edit}
                  >
                    Edit
                  </RowActionMenuItem>
                  {!row.original.approvedAt && adminMode && (
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
                  {!row.original.rejectedAt && adminMode && (
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
                    disabled={row.original.paymentId > 0}
                    row={row.original}
                    action={deleteJobAction}
                  />
                </RowActionMoreMenu>
              </RowActionCell>
            ),
          },
        ]
      ),
      ..._FilterColumn(
        "_projectId",
        "_q",
        "_userId",
        "_show",
        "_builderId",
        "_date"
      ),
    ], //.filter(Boolean) as any,
    [data, isPending]
  );
  return (
    <DataTable2
      searchParams={searchParams}
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
      dateFilterColumns={[
        {
          id: "_date" as any,
          title: "Date",
        },
      ]}
      //  deleteRowsAction={() => void deleteSelectedRows()}
    />
  );
}
