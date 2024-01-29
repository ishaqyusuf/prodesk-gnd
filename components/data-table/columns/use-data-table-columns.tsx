"use client";

import { ColumnDef } from "@tanstack/react-table";
import React, { ReactElement, useState } from "react";
import { useDatableCheckbox } from "./checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

type CellValueType<T> = ((item: T) => any) | keyof T;
type CtxType<T> = {
  PrimaryColumn(title, value: CellValueType<T>): ColumnDef<T, unknown>;
  Column(title, Column: ({ data }: { data: T }) => React.ReactElement);
  Primary({ children });
  Secondary({ children });
};
export default function useDataTableColumn<T>(
  data: T[],
  cells: (ctx: CtxType<T>) => ColumnDef<T, unknown>[],
  checkable = true
) {
  const [isPending, startTransition] = React.useTransition();
  // type ValueType = typeof keyof T;
  const checkBox = useDatableCheckbox(data);

  const ctx: CtxType<T> = {
    startTransition,
    addColumns(...__columns) {
      // _setColumns(__columns);
    },
    Column(title, Column: ({ data }: { data: T }) => React.ReactElement) {
      return {
        accessorKey: title.toLowerCase(),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={title} />
        ),
        cell: ({ cell }) => <Column data={cell.row.original} />,
      };
    },
    Primary({ children }) {
      return <p className="font-semibold">{children}</p>;
    },
    Secondary({ children }) {
      return <p className="text-muted-foreground">{children}</p>;
    },
    PrimaryColumn(
      title,
      Value: CellValueType<T> | (({ data }: { data: T }) => React.ReactElement)
    ): ColumnDef<T, unknown> {
      return {
        accessorKey: title.toLowerCase(),
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={title} />
        ),
        cell: ({ cell }) => {
          const Cell: any = React.isValidElement(Value)
            ? Value
            : (undefined as any);
          if (Cell) return <Cell data={cell.row.original} />;
          const PrimaryNode = this.Primary;
          return <PrimaryNode>{cell.row.original[Value as any]}</PrimaryNode>;
        },
      };
    },
  } as any;
  const columns = React.useMemo<ColumnDef<T, unknown>[]>(
    () => [checkable && checkBox.column, ...cells(ctx)].filter(Boolean) as any,
    [data, isPending]
  );
  return {
    ...ctx,
    columns,
  };
}
