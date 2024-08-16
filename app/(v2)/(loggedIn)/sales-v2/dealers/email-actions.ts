"use server";

import { sendMessage } from "@/app/(v1)/_actions/email";
import { prisma } from "@/db";
import { isProdClient } from "@/lib/is-prod";

interface DealerEmailProps {
    emailId?: number;
    data?: any;
    body?: string;
    subject?: string;
    from?: string;
    to?: string;
}
export async function dealerEmail(data: DealerEmailProps) {
    let from = isProdClient
        ? data.from || `Pablo From GND Millwork<noreply@gndprodesk.com>`
        : `Ishaq Yusuf From GND Millwork<ishaqyusuf@gndprodesk.com>`;
    await sendMessage({
        subject: data.subject,
        body: data.body,
        from,
        to: data.to,
        type: "Dealers",
    } as any);
}
export async function signupSuccess(id) {
    const auth = await prisma.dealerAuth.findUniqueOrThrow({
        where: { id },
    });
    await dealerEmail({
        body: `Your dealership request has been submitted successful. We will review and get back to you`,
        to: auth.email,
    });
}
