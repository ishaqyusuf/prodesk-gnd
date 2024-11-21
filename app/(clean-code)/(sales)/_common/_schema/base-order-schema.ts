import { z } from "zod";
import {
    DISPATCH_FILTER_OPTIONS,
    INVOICE_FILTER_OPTIONS,
    PRODUCTION_ASSIGNMENT_FILTER_OPTIONS,
    PRODUCTION_FILTER_OPTIONS,
} from "../utils/contants";
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
    "dispatch.status": z.string().optional(),
    "production.assignment": z.string().optional(),
    production: z.string().optional(),
    invoice: z.string().optional(),
});
export type SalesFilterKeys = keyof typeof salesSearchSchema._type;
export const staticOrderFilters: Partial<{ [k in SalesFilterKeys]: any }> = {
    invoice: INVOICE_FILTER_OPTIONS,
    "dispatch.status": DISPATCH_FILTER_OPTIONS,
    production: PRODUCTION_FILTER_OPTIONS,
    "production.assignment": PRODUCTION_ASSIGNMENT_FILTER_OPTIONS,
};

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
    {
        label: "Dispatch Status",
        type: "checkbox",
        value: "dispatch.status",
        options: [],
    },
    {
        label: "Production Assignment",
        type: "checkbox",
        value: "production.assignment",
        options: [],
    },
    {
        label: "Production",
        type: "checkbox",
        value: "production",
        options: [],
    },
    {
        label: "Invoice",
        type: "checkbox",
        value: "invoice",
        options: [],
    },
    {
        label: "Sales Rep",
        type: "checkbox",
        value: "sales.rep",
        options: [],
    },
] satisfies DataTableFilterField<any>[];
