import { prisma } from "@/db";
import { AddressBooks } from "@prisma/client";

export async function updateAddressDta(
    id,
    orderId,
    data: Partial<AddressBooks>
) {
    const resp = await prisma.addressBooks.update({
        where: { id },
        data: {
            ...data,
        },
    });
    return {
        status: "success",
        id,
    };
}
