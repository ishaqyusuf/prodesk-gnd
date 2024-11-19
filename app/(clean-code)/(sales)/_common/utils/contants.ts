import { DataTableFilterField } from "@/components/(clean-code)/data-table/type";
import { SalesDispatchStatus } from "../../types";

export const filterFields = {
    customerName: {
        label: "Customer Name",
        type: "input",
        value: "customer",
        options: [],
    },
    address: {
        label: "Address",
        type: "input",
        value: "address",
        options: [],
    },
} satisfies {
    [key in string]: DataTableFilterField<any>;
};
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
