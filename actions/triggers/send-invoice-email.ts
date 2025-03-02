"use server";
import { prisma } from "@/db";
import { resend } from "@/lib/resend";
import { nanoid } from "nanoid";
import { render } from "@react-email/render";
import { composeSalesEmail } from "@/modules/email/emails/invoice";
import { env } from "@/env.mjs";
import QueryString from "qs";
import { tasks } from "@trigger.dev/sdk/v3";

export const __sendInvoiceEmailTrigger = async (id) => {
    console.log("SENDING EMAIL");
    // await tasks.trigger("send-invoice-email", {
    //     salesId: id,
    // });
    // return;
    const sales = await prisma.salesOrders.findFirstOrThrow({
        where: {
            id,
        },
        select: {
            slug: true,
            id: true,
            type: true,
            salesRep: {
                select: {
                    name: true,
                    email: true,
                },
            },
            customer: {
                select: {
                    email: true,
                    name: true,
                    businessName: true,
                },
            },
            billingAddress: {
                select: {
                    email: true,
                    name: true,
                },
            },
        },
    });
    console.log(sales.customer);

    let customerEmail: any =
        sales.customer?.email || sales.billingAddress?.email;
    if (!customerEmail) throw new Error("Customer has no valid email");
    env.NODE_ENV == "development" &&
        (customerEmail = ["ishaqyusuf024@gmail.com", "pcruz321@gmail.com"]);
    const salesRepEmail = sales.salesRep.email || undefined;
    const customerName =
        sales.customer?.businessName ||
        sales.customer?.name ||
        sales.billingAddress?.name;
    const salesRep = sales.salesRep?.name;
    const isQuote = sales.type == "quote";
    const response = await resend.emails.send({
        from: `GND Millwork <${salesRepEmail?.split("@")[0]}@gndprodesk.com>`,
        to: customerEmail,
        reply_to: salesRepEmail,
        headers: {
            "X-Entity-Ref-ID": nanoid(),
        },
        subject: `${salesRep} sent you ${isQuote ? "a quote" : "an invoice"}`,
        html: await render(
            composeSalesEmail({
                type: sales.type as any,
                customerName,
                link: `https://gnd-prodesk.vercel.app/api/pdf/download?${QueryString.stringify(
                    {
                        id: sales.id,
                        slugs: sales.slug,
                        mode: sales.type,
                        preview: false,
                    }
                )}`,
                salesRep,
            })
        ),
    });
    if (response.error) throw new Error(`Unable to send email`);
};
