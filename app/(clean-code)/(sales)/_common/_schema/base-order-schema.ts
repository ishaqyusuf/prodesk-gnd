import { z } from "zod";
import { filterFields } from "../utils/contants";
import { DataTableFilterField } from "@/components/(clean-code)/data-table/type";

export const salesSearchSchema = z.object({
    status: z.string().optional(),
    address: z.string().optional(),
    customer: z.string().optional(),
    delivery: z.string().optional(),
    orderId: z.string().optional(),
    po: z.string().optional(),
    phone: z.string().optional(),
    rep: z.string().optional(),
});

export const salesFilterFields = [
    {
        label: "order no",
        type: "input",
        value: "orderId",
    },
    {
        label: "P.O",
        type: "input",
        value: "po",
        options: [],
    },
    {
        label: "Phone",
        type: "input",
        value: "phone",
        options: [],
    },
    // filterFields.address,
    filterFields.customerName,
    // {
    //     label: "status",
    //     type: "input",
    //     value: "status",
    // },
    // {

    // {
    //     label: "Delivery",
    //     type: "checkbox",
    //     value: "delivery",
    //     options: ["delivered", "pending delivery", "backorder", "late"].map(
    //         (value) => ({ label: value, value })
    //     ),
    // },
    // {
    //     label: "Production Assignment",
    //     type: "checkbox",
    //     value: "productionAssignment",
    //     options: ["not assigned", "part assigned", "all assigned"].map(
    //         (value) => ({ label: value, value })
    //     ),
    // },
    // {
    //     label: "Production",
    //     type: "checkbox",
    //     value: "production",
    //     options: ["pending", "in progress", "completed"].map((value) => ({
    //         label: value,
    //         value,
    //     })),
    // },
    // {
    //     label: "Invoice",
    //     type: "checkbox",
    //     value: "invoice",
    //     options: ["paid", "pending", "late", "part-paid"].map((value) => ({
    //         label: value,
    //         value,
    //     })),
    // },
    {
        label: "Sales Rep",
        type: "checkbox",
        value: "rep",
        options: [],
    },
] satisfies DataTableFilterField<any>[];
