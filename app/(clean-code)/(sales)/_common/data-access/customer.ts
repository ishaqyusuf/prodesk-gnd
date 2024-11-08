import { prisma } from "@/db";

export async function updateCustomerEmailDta(id, email) {
    await prisma.customers.update({
        where: {
            id,
        },
        data: {
            email,
        },
    });
}
