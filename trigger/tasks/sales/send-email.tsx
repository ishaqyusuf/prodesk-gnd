import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const sendInvoiceEmail = schemaTask({
    id: "send-invoice-email",
    schema: z.object({
        salesId: z.number(),
        // customerEmail: z.string(),
        // salesRep: z.string(),
        // salesRepEmail: z.string(),
        // customerName: z.string(),
    }),
    maxDuration: 300,
    queue: {
        concurrencyLimit: 10,
    },
    run: async ({ salesId }) => {
        await fetch(
            `https://gnd-prodesk.vercel.app/api/cron/send-sales-email`,
            {
                body: JSON.stringify({
                    salesId,
                }),
            }
        ).then((r) => r.body);
    },
});
