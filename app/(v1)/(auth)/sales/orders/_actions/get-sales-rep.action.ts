"use server";

import { prisma } from "@/db";

export async function _getSalesRep() {
    const users = await prisma.users.findMany({
        where: {
            reppedProductions: {
                some: {
                    id: { gt: 0 },
                },
            },
        },
        select: {
            id: true,
            name: true,
        },
    });
    return users;
}
