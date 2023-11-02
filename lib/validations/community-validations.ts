import { z } from "zod";

export const projectSchema = z.object({
    title: z.string(),
    refNo: z.string().optional(),
    builderId: z.number(),
    address: z.string().optional(),
    meta: z
        .object({
            supervisor: z
                .object({
                    name: z.string().optional(),
                    email: z.string().optional()
                })
                .optional()
        })
        .optional()
});
export const homeSchema = z.object({
    projectId: z.number(),
    units: z
        .object({
            communityTemplateId: z.number(),
            lot: z.string().optional(),
            block: z.string().optional(),
            createdAt: z.date().optional(),
            homeKey: z.string().optional(),
            meta: z.object({})
        })
        .array()
});
