"use client";

import { staticBuildersAction } from "@/app/_actions/community/builders";

import { DynamicFilter } from "../data-table/data-table-dynamic-filter";

export function BuilderFilter({ table }) {
  return (
    <DynamicFilter
      table={table}
      single
      listKey="staticBuilders"
      labelKey="name"
      valueKey="id"
      title="Builders"
      columnId="_builderId"
      loader={staticBuildersAction}
    />
  );
}
