"use client";
import { store } from "@/store";
import { setNav } from "@/store/headerNavSlice";
import navs from "@/lib/use-nav-links";
import { useEffect } from "react";
import { productionColumns } from "../../app/(auth)/sales/productions/components/production-columns";
import * as React from "react";
import { _useReactTable } from "@/components/table/table";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { DataTable2 } from "@/components/table/data-table-2";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import { DataTableFacetedFilter } from "@/components/table/data-table-faceted-filter";
import { DataTableFacetedDate } from "@/components/table/data-table-facetted-date";
import ClientList from "../client-list";
import tableSelectColumn from "../table/table-select-column";
import { ProdOrderColumn } from "../columns/productions";

interface Props {
  data;
  page?: "my-production" | "admin-production";
}
export default function ProductionList({
  data,
  page = "admin-production",
}: Props) {
  useEffect(() => {
    store.dispatch(setNav([navs.sales, navs.salesProduction]));
  }, []);
  const tableCtx = _useReactTable({
    columns: productionColumns,
  });
  const isAdmin = page == "admin-production";
  // return (
  //   <ClientList
  //     data={data}
  //     search
  //     paginate
  //     columns={
  //       [
  //         tableSelectColumn({}),
  //         ProdOrderColumn({
  //           link(row) {
  //             return isAdmin
  //               ? `/sales/productions/${row.slug}`
  //               : `/tasks/sales-productions/${row.slug}`;
  //           },
  //         }),
  //       ].filter(Boolean) as any
  //     }
  //   />
  // );
  return (
    <div className="space-y-4">
      <DataTableToolbar
        search
        table={tableCtx.table}
        isFiltered={tableCtx.isFiltered}
      >
        <DataTableFacetedFilter
          _key="status"
          title="Status"
          table={tableCtx.table}
          options={[
            { label: "Started", value: "Started" },
            { label: "Queued", value: "Queued" },
            { label: "Completed", value: "Completed" },
            // { label: "Completed", value: "Completed" },
          ]}
        />
        <DataTableFacetedDate
          range
          rangeSwitch
          filterTypes={[
            { label: "Due Date", value: "prodDueDate" },
            { label: "Order Date", value: "createdAt" },
          ]}
          table={tableCtx.table}
        />
      </DataTableToolbar>
      <DataTable2 data={data} tableIndexName="productions" ctx={tableCtx} />
      <DataTablePagination table={tableCtx.table} />
    </div>
  );
}
