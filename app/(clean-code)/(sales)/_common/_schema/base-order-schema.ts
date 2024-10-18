import { z } from "zod";
import { filterFields } from "../utils/contants";

export const salesSearchSchema = z.object({
    // _q: z.string(),
    address: z.string().optional(),
    customer: z.string().optional(),
});

export const salesFilterFields = [
    filterFields.customerName,
    filterFields.address,
];
