import { user } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";

type Attachables = "sale invoice" | "payment receipts";
export interface EmailData {
    type?: "sales";
    attachables?: Attachables[];
    email: string;
    fallbackEmail?: string;
    name: string;
    noEmail?: boolean;
}
export async function getSalesEmailDta(salesId): Promise<EmailData> {
    const sale = await prisma.salesOrders.findFirstOrThrow({
        where: {
            id: salesId,
        },
        select: {
            id: true,
            orderId: true,
            customer: {
                select: {
                    id: true,
                    email: true,
                    businessName: true,
                    name: true,
                },
            },
            billingAddress: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    });
    const resp: EmailData = {
        attachables: ["sale invoice"],
        email: sale.customer.email,
        fallbackEmail: sale.billingAddress.email,
        name: sale.customer.businessName || sale.customer.name,
        noEmail: false,
    };
    resp.noEmail = !resp.email && !resp.fallbackEmail;
    return resp;
}
export async function inboxDta(type: EmailData["type"], salesId) {
    const inbox = await prisma.inbox.findMany({
        where: {
            parentId: salesId,
            type,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            attachments: true,
        },
    });
    return inbox;
}
export async function userEmailProfileDta(type: EmailData["type"]) {
    const auth = await user();
    const userId = auth.id;

    return {
        from: `${auth.name}<${auth.email}>`,
    };
}
