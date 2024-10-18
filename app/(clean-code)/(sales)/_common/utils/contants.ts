import { DataTableFilterField } from "@/components/(clean-code)/data-table/type";

export const filterFields = {
    customerName: {
        label: "Customer Name",
        type: "input",
        value: "customer",
        options: [{ label: "Customer 1", value: "Customer 2" }],
    },
    address: {
        label: "Address",
        type: "input",
        value: "address",
        options: [{ label: "Address 1", value: "Address2" }],
    },
} satisfies {
    [key in string]: DataTableFilterField<any>;
};
export const SEPARATOR = ` &`;
