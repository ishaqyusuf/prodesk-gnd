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
