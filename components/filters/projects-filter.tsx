"use client";

import { staticBuildersAction } from "@/app/_actions/community/builders";

import { DynamicFilter } from "../data-table/data-table-dynamic-filter";

export function ProjectsFilter({ table }) {
  return (
    <DynamicFilter
      table={table}
      single
      listKey="staticProjects"
      labelKey="title"
      valueKey="id"
      title="Projects"
      columnId="_projectId"
      loader={staticBuildersAction}
    />
  );
}
