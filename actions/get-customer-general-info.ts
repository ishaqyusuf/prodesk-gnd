"use server";

import { prisma } from "@/db";

export async function getCustomerGeneralInfoAction(phoneNo) {
    const customers = await prisma.customers.findMany({
        where: {
            phoneNo,
        },
        select: {
            id: true,
            name: true,
            businessName: true,
            phoneNo: true,
            email: true,
        },
    });
    const email = customers.find((s) => s.email)?.email;
    return {
        customers,
        email,
    };
}
