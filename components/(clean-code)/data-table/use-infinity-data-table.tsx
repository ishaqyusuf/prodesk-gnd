"use client";

import type {
    ColumnDef,
    ColumnFiltersState,
    RowSelectionState,
    SortingState,
    Table as TTable,
    VisibilityState,
} from "@tanstack/react-table";
import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQueryStates } from "nuqs";
import { searchParamsParser } from "./search-params";
import {
    useInfiniteQuery,
    type FetchNextPageOptions,
} from "@tanstack/react-query";

import { Percentile } from "@/lib/request/percentile";
import { inDateRange, arrSome } from "@/lib/table/filterfns";
import { dataOptions } from "./query-options";

export function useInfiniteDataTable({
    columns,
    // data,
    // defaultColumnFilters = [],
    // defaultColumnSorting = [],
    defaultRowSelection = {},
    filterFields: __filterFields,
    serverAction,
    ...props
}) {
    const [search] = useQueryStates(searchParamsParser);
    const { data, isFetching, isLoading, fetchNextPage } = useInfiniteQuery(
        dataOptions(search, serverAction)
    );
    const { sort, start, size, uuid, ...filter } = search;
    const defaultColumnFilters = Object.entries(filter)
        .map(([key, value]) => ({
            id: key,
            value,
        }))
        .filter(({ value }) => value ?? undefined);
    const flatData = React.useMemo(
        () => data?.pages?.flatMap((page) => page.data ?? []) ?? [],
        [data?.pages]
    );
    const lastPage = data?.pages?.[data?.pages.length - 1];
    const totalRows = lastPage?.meta?.totalRowCount;
    const filterRows = lastPage?.meta?.filterRowCount;
    const totalFilters = lastPage?.meta?.totalFilters;
    const currentPercentiles = lastPage?.meta?.currentPercentiles;
    const totalRowsFetched = flatData?.length;

    const defaultColumnSorting = sort ? [sort] : undefined;
    const filterFields = React.useMemo(
        () =>
            __filterFields.map((field) => {
                if (
                    field.value === "latency" ||
                    field.value === "timing.dns" ||
                    field.value === "timing.connection" ||
                    field.value === "timing.tls" ||
                    field.value === "timing.ttfb" ||
                    field.value === "timing.transfer" ||
                    field.value === "status"
                ) {
                    field.options =
                        totalFilters?.[field.value].map((value) => ({
                            label: `${value}`,
                            value,
                        })) ?? field.options;
                }
                if (field.value === "host" || field.value === "pathname") {
                    field.options =
                        totalFilters?.[field.value].map((value) => ({
                            label: `${value}`,
                            value,
                        })) ?? field.options;
                }
                return field;
            }),
        [totalFilters]
    );
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>(defaultColumnFilters);
    const [sorting, setSorting] =
        React.useState<SortingState>(defaultColumnSorting);
    const [rowSelection, setRowSelection] =
        React.useState<RowSelectionState>(defaultRowSelection);
    const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
        "data-table-column-order",
        []
    );

    const [columnVisibility, setColumnVisibility] =
        useLocalStorage<VisibilityState>("data-table-visibility", {
            uuid: false,
            "timing.dns": false,
            "timing.connection": false,
            "timing.tls": false,
            "timing.ttfb": false,
            "timing.transfer": false,
        });
    const [controlsOpen, setControlsOpen] = useLocalStorage(
        "data-table-controls",
        true
    );
    const topBarRef = React.useRef<HTMLDivElement>(null);
    const [topBarHeight, setTopBarHeight] = React.useState(0);
    const [_, setSearch] = useQueryStates(searchParamsParser);

    React.useEffect(() => {
        const observer = new ResizeObserver(() => {
            const rect = topBarRef.current?.getBoundingClientRect();
            if (rect) {
                setTopBarHeight(rect.height);
            }
        });

        const topBar = topBarRef.current;
        if (!topBar) return;

        observer.observe(topBar);
        return () => observer.unobserve(topBar);
    }, [topBarRef]);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        function onScroll() {
            // TODO: add a threshold for the "Load More" button
            const onPageBottom =
                window.innerHeight + Math.round(window.scrollY) >=
                document.body.offsetHeight;
            if (onPageBottom && !isFetching && totalRowsFetched < filterRows) {
                fetchNextPage();
            }
        }

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [fetchNextPage, isFetching, filterRows, totalRowsFetched]);

    const table = useReactTable({
        data: flatData,
        columns,
        state: {
            columnFilters,
            sorting,
            columnVisibility,
            rowSelection,
            columnOrder,
        },
        enableMultiRowSelection: false,
        // @ts-ignore FIXME: because it is not in the types
        getRowId: (row, index) => `${row?.uuid}` || `${index}`,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnOrderChange: setColumnOrder,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: (table, columnId: string) => () => {
            const map = getFacetedUniqueValues()(table, columnId)();
            // TODO: it would be great to do it dynamically, if we recognize the row to be Array.isArray
            if (["regions"].includes(columnId)) {
                const rowValues = table
                    .getGlobalFacetedRowModel()
                    .flatRows.map((row) => row.getValue(columnId) as string[]);
                for (const values of rowValues) {
                    for (const value of values) {
                        const prevValue = map.get(value) || 0;
                        map.set(value, prevValue + 1);
                    }
                }
            }
            return map;
        },
        filterFns: { inDateRange, arrSome },
    });

    React.useEffect(() => {
        const columnFiltersWithNullable = filterFields.map((field) => {
            const filterValue = columnFilters.find(
                (filter) => filter.id === field.value
            );
            if (!filterValue) return { id: field.value, value: null };
            return { id: field.value, value: filterValue.value };
        });

        const search = columnFiltersWithNullable.reduce((prev, curr) => {
            prev[curr.id as string] = curr.value;
            return prev;
        }, {} as Record<string, unknown>);

        setSearch(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnFilters]);

    React.useEffect(() => {
        setSearch({ sort: sorting?.[0] || null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorting]);

    const selectedRow = React.useMemo(() => {
        const selectedRowKey = Object.keys(rowSelection)?.[0];
        return table
            .getCoreRowModel()
            .flatRows.find((row) => row.id === selectedRowKey);
    }, [rowSelection, table]);

    // FIXME: cannot share a uuid with the sheet details
    React.useEffect(() => {
        if (Object.keys(rowSelection)?.length && !selectedRow) {
            setSearch({ uuid: null });
            setRowSelection({});
        } else {
            setSearch({ uuid: Object.keys(rowSelection)?.[0] || null });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection, selectedRow]);
    return {
        table,
        filterFields,
        columns,
        ...props,
        isLoading,
        setControlsOpen,
        controlsOpen,
        enableColumnOrdering: true,
        totalRowsFetched,
        filterRows,
        isFetching,
        fetchNextPage,
        totalRows,
    };
}
