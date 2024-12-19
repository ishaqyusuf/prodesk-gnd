import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export async function updateCustomerEmailDta(id, email) {
    if (!id) throw new Error("Customer id is required");
    await prisma.customers.update({
        where: {
            id,
        },
        data: {
            email,
        },
    });
}
export async function saveCustomerDta(data: Prisma.CustomersCreateInput) {
    const customer = await prisma.customers.upsert({
        where: {
            phoneNo: data.phoneNo,
        },
        create: data,
        update: {
            businessName: data.businessName || undefined,
            email: data.email || undefined,
            name: data.name || undefined,
            phoneNo2: data.phoneNo2 || undefined,
        },
    });

    return customer;
}
