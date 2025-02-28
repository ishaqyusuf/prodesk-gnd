"use server";

import { prisma } from "@/db";

export async function updateCustomerEmailAction(phoneNo, email) {
    const existings = await prisma.customers.findMany({
        where: {
            email,
            phoneNo: {
                not: phoneNo,
            },
        },
    });
    if (existings.length) throw new Error("Customer with email already exist!");
    await prisma.customers.updateMany({
        where: {
            phoneNo,
        },
        data: {
            email,
        },
    });
}
