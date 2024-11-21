import { DataTableFilterField } from "@/components/(clean-code)/data-table/type";
import { SalesDispatchStatus } from "../../types";
import {
    filterCol,
    filterFields,
    Filters,
} from "@/components/(clean-code)/data-table/filter-command/filters";

export const SEPARATOR = ` &`;

export const dispatchStatusList: SalesDispatchStatus[] = [
    "queue",
    "in progress",
    "cancelled",
    "completed",
];

export const INVOICE_FILTER_OPTIONS = ["paid", "pending", "late", "part-paid"];
export const PRODUCTION_FILTER_OPTIONS = [
    "pending",
    "in progress",
    "completed",
];
export const PRODUCTION_ASSIGNMENT_FILTER_OPTIONS = [
    "not assigned",
    "part assigned",
    "all assigned",
];
export const DISPATCH_FILTER_OPTIONS = [
    "delivered",
    "pending delivery",
    "backorder",
    "late",
];
export const __filters: Filters = {
    orders: {
        fields: [
            filterFields["order.no"],
            filterFields.po,
            filterFields.phone,
            filterFields["customer.name"],
            filterFields["dispatch.status"],
            filterFields["production.assignment"],
            filterFields.production,
            filterFields.invoice,
            filterFields["sales.rep"],
        ],
        filterColumns: [
            filterCol("order.no"),
            filterCol("customer.name"),
            filterCol("dispatch.status"),
            filterCol("production.assignment"),
            filterCol("production"),
            filterCol("invoice"),
            filterCol("sales.rep"),
        ],
        options: {
            invoice: INVOICE_FILTER_OPTIONS,
            "dispatch.status": DISPATCH_FILTER_OPTIONS,
            production: PRODUCTION_FILTER_OPTIONS,
            "production.assignment": PRODUCTION_ASSIGNMENT_FILTER_OPTIONS,
        },
    },
    quotes: {
        fields: [],
        options: {},
    },
    ["sales-delivery"]: {
        fields: [],
        options: {},
    },
};
