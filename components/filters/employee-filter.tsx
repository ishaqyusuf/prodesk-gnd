"use client";

import { staticEmployees } from "@/app/_actions/hrm/get-employess";
import { DynamicFilter } from "../data-table/data-table-dynamic-filter";

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
export function TechEmployeeFilter({ table }) {
  return (
    <DynamicFilter
      table={table}
      single
      listKey="staticTechEmployees"
      labelKey="name"
      valueKey="id"
      title="Tech"
      columnId="_userId"
      loader={async () => {
        return await staticEmployees({
          role: "Punchout",
        });
      }}
    />
  );
}
