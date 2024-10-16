import { z } from "zod";
import { filterFields } from "../utils/contants";

export const salesSearchSchema = z.object({
    // _q: z.string(),
    // address: z.string(),
    customer: z.string(),
});

export const salesFilterFields = [
    filterFields.customerName,
    filterFields.address,
];
