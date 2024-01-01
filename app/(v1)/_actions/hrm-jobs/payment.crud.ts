"use server";

import { prisma } from "@/db";
import { revalidatePath } from "next/cache";

export async function _deleteJobPayment(paymentId) {
    const u = await prisma.jobs.updateMany({
        where: {
            paymentId
        },
        data: {
            status: "Payment Cancelled",
            paymentId: null,
            statusDate: new Date()
        }
    });

    await prisma.jobPayments.delete({
        where: {
            id: paymentId
        }
    });
    revalidatePath("/contractor/jobs/payments", "page");
}
