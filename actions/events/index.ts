"use server";
import { EventTypes } from "@/utils/constants";
import { salesCreatedEvent } from "./sales-created-event";
import { prisma } from "@/db";

import { z } from "zod";
import { SendComposedEmailSchema } from "@/trigger/schema";
import { sendComposedEmail } from "@/trigger/tasks/email/send-composed-email";

export async function triggerEvent(event: EventTypes, id) {
    const composed = await (async () => {
        switch (event) {
            case "salesCreated":
            case "salesUpdated":
                return await salesCreatedEvent(id);
        }
    })();
    const data: z.infer<typeof SendComposedEmailSchema> = {
        data: composed.stack,
        from: {
            name: "GND Task Action",
            email: "gndsiteaction@gndprodesk.com",
        },
        preview: composed.preview,
        subject: composed.subject,
        to: ["ishaqyusuf024@gmail.com", "pcruz321@gmail.com"],
    };
    sendComposedEmail.trigger(data);
}
export async function salesEventData(id) {
    const sale = await prisma.salesOrders.findUnique({
        where: {
            id,
        },
        select: {
            amountDue: true,
            orderId: true,
            id: true,
            grandTotal: true,
            type: true,
            salesRep: {
                select: {
                    name: true,
                },
            },
            customer: {
                select: {
                    name: true,
                    businessName: true,
                    address: true,
                    phoneNo: true,
                },
            },
            billingAddress: {
                select: {
                    name: true,
                    address1: true,
                },
            },
        },
    });
    return sale;
}
