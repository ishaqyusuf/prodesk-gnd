import { DataTableFilterField } from "@/components/(clean-code)/data-table/type";

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
