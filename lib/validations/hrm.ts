import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string(),
  username: z.string().optional(),
  email: z.string().email(),
  role: z.object({
    id: z.number(),
  }),
});
