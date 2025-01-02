import { user } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";

export async function generateSalesId(type) {
    const usr = (await user())?.name
        ?.split(" ")
        ?.filter(Boolean)
        .map((a) => a[0]?.toUpperCase())
        .join("");
    const count = await prisma.salesOrders.count({
        where: {
            deletedAt: {},
            type,
        },
    });
    return `${count?.toString()?.padStart(5, "0")}${usr}`;
}
