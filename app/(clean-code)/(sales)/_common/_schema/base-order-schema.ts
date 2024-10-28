import { z } from "zod";
import { filterFields } from "../utils/contants";
import { DataTableFilterField } from "@/components/(clean-code)/data-table/type";

export const salesSearchSchema = z.object({
    status: z.string().optional(),
    address: z.string().optional(),
    customer: z.string().optional(),
});

export const salesFilterFields = [
    filterFields.address,
    filterFields.customerName,
    {
        label: "status",
        type: "input",
        value: "status",
    },
] satisfies DataTableFilterField<any>[];
