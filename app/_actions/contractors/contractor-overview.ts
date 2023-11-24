"use server";

import { prisma } from "@/db";

export async function _getContractor(id) {
    const contractor = await prisma.users.findUnique({
        where: { id },
        include: {
            jobs: {
                take: 5,
                orderBy: {
                    createdAt: "desc"
                }
            },
            documents: true
        }
    });
    return contractor;
}
