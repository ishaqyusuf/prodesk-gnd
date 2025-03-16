import { z } from "zod";

export const changeSalesChartTypeSchema = z.enum(["sales"]);

export const createCustomerSchema = z.object({
    id: z.number().optional(),
    phoneNo: z.string().optional(),
    phoneNo2: z.string().optional(),
    email: z.string().optional(),
    address_1: z.string().optional(),
    name: z.string(),
    businessName: z.string(),
    zip_code: z.string().optional(),
    profileId: z.number().optional(),
});
