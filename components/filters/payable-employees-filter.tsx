"use client";

import { staticEmployees } from "@/app/_actions/hrm/get-employess";
import { DynamicFilter } from "../data-table/data-table-dynamic-filter";
import { staticBuildersAction } from "@/app/_actions/community/builders";

export function PayableEmployees({ table }) {
  return (
    <DynamicFilter
      table={table}
      single
      listKey="staticPayableEmployees"
      labelKey="name"
      valueKey="id"
      title="Employee"
      columnId="_userId"
      loader={staticEmployees}
    />
  );
}
