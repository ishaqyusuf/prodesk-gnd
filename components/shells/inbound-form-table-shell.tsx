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
import { IInboundOrderItems } from "@/types/sales-inbound";
import { ISalesOrderItem } from "@/types/sales";
import { OrderCustomerCell, OrderInvoiceCell } from "../columns/sales-columns";
import StatusBadge from "../status-badge";
import { InboundColumns } from "../forms/sales-inbound-order-form/inbound-columns";

export default function InboundFormTableShell<T>({
  data,
  pageInfo,
  suppliers,
}: TableShellProps<ISalesOrderItem> & { suppliers: string[] }) {
  const [isPending, startTransition] = useTransition();

  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);

  const columns = InboundColumns(selectedRowIds, setSelectedRowIds, data);
  return (
    <DataTable2
      columns={columns}
      pageInfo={pageInfo}
      data={data}
      filterableColumns={[
        {
          id: "_supplier",
          title: "Supplier",
          // single: true,
          options: [
            { label: "No Supplier", value: "No Supplier" },
            ...suppliers?.map((label) => ({ label, value: label })),
          ],
        },
      ]}
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
