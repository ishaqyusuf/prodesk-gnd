"use client";

import { staticBuildersAction } from "@/app/_actions/community/builders";

import { useAppSelector } from "@/store";
import { loadStaticList, ISlicer } from "@/store/slicers";
import { useEffect } from "react";
import { DataTableFacetedFilter2 } from "../data-table/data-table-faceted-filter-2";

interface Props {
  table;
  listKey: keyof ISlicer;
  labelKey?;
  valueKey?;
  single?: Boolean;
  title;
  loader?;
  columnId;
}
export function DynamicFilter({
  table,
  columnId,
  loader,
  listKey,
  ...props
}: Props) {
  const list = useAppSelector((state) => state.slicers[listKey]);

  useEffect(() => {
    // init();
    loadStaticList(listKey, list, loader);
  }, [list, listKey, loader]);
  if (!list) return null;
  return (
    <div>
      <DataTableFacetedFilter2
        column={table.getColumn(columnId)}
        {...props}
        options={list as any}
      />
    </div>
  );
}
