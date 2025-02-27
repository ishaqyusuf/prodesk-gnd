import { prisma } from "@/db";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const sendInvoiceEmail = schemaTask({
    id: "send-invoice-email",
    schema: z.object({
        invoiceId: z.string(),
    }),
    maxDuration: 300,
    queue: {
        concurrencyLimit: 10,
    },
    run: async ({ invoiceId }) => {
        const user = await prisma.users.findFirst({});
        return {
            user,
        };
    },
});
