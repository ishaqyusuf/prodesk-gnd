import { createColumnHelper } from "@tanstack/react-table";
import { FilterKeys } from "../search-params";
import { DataTableFilterField } from "../type";

export const queryKeys = ["orders", "quotes", "sales-delivery"] as const;
export type QueryKeys = (typeof queryKeys)[number];
export type Filters = Partial<{
    [id in QueryKeys]: Partial<{
        fields: any[];
        options: Partial<{
            [id in FilterKeys]: any;
        }>;
        filterColumns: FilterColumn[];
    }>;
}>;
type FilterColumn = ReturnType<typeof columnHelper.accessor>;
const columnHelper = createColumnHelper<any>();
export function filterCol(name: FilterKeys): FilterColumn {
    return columnHelper.accessor(name, {
        header: null,
        // meta: { isHidden: true },
        enableColumnFilter: true,
        // isVisible: false,

        cell: () => null,
    });
}
function filterField(
    value: FilterKeys,
    type: "checkbox" | "input" = "input",
    options = [],
    label?
) {
    // if (!label) label = label?.toLowerCase()?.replaceAll(" ", ".");
    return {
        [value]: {
            value,
            label,
            type,
            options,
        },
    };
}
export const filterFields: Partial<{
    [k in FilterKeys]: DataTableFilterField<any>;
}> = {
    ...filterField("customer.name"),
    ...filterField("address"),
    ...filterField("order.no"),
    ...filterField("po"),
    ...filterField("phone"),
    ...filterField("dispatch.status", "checkbox"),
    ...filterField("production.assignment", "checkbox"),
    ...filterField("production", "checkbox"),
    ...filterField("invoice", "checkbox"),
    ...filterField("sales.rep", "checkbox"),
};
export const composeFilter = (
    queryKey: QueryKeys,
    { fields, options }: Filters["orders"],
    loadedFilters?
) => {
    const f = fields?.map((filter: any) => {
        const filterData =
            loadedFilters?.[filter?.value] || options?.[filter?.value];
        if (filterData) {
            filter.options = filterData.map((value) => ({
                value,
                label: value,
            }));
        }
        return filter;
    });
    return {
        queryKey,
        filterFields: f,
    };
};
