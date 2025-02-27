import { resend } from "@/lib/resend";
// import { PrismaClient } from "@prisma/client";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { nanoid } from "nanoid";
import { render } from "@react-email/render";
import { SalesInvoiceEmail } from "@/modules/email/emails/invoice";
import { error } from "console";

// const prisma = new PrismaClient();
export const sendInvoiceEmail = schemaTask({
    id: "send-invoice-email",
    schema: z.object({
        invoiceId: z.string(),
        customerEmail: z.string(),
        salesRep: z.string(),
        salesRepEmail: z.string(),
        customerName: z.string(),
    }),
    maxDuration: 300,
    queue: {
        concurrencyLimit: 10,
    },
    run: async ({
        invoiceId,
        customerEmail,
        salesRep,
        customerName,
        salesRepEmail,
    }) => {
        // const user = await prisma.salesOrders.findFirst({
        //     where: {
        //         orderId: invoiceId,
        //     },
        // });
        // return {
        //     user,
        // };
        const response = await resend.emails.send({
            from: `GND Millwork <gndbot@gndprodesk.com>`,
            to: customerEmail,
            reply_to: salesRepEmail,
            headers: {
                "X-Entity-Ref-ID": nanoid(),
            },
            subject: `${salesRep} sent you and invoice <`,
            html: await render(
                <SalesInvoiceEmail
                    customerName={customerName}
                    link={``}
                    salesRep={salesRep}
                />
            ),
        });
        if (response.error) {
            logger.error("Invoice email failed to send", {
                invoiceId,
                error: response.error,
            });
            throw new Error("Invoice email failed to send");
        }
    },
});
