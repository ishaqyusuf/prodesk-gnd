"use server";

import { _cache } from "@/app/(v1)/_actions/_cache/load-data";
import { prisma } from "@/db";

export async function _getSalesRep() {
    return await _cache(
        "sales-rep",
        async () => {
            const users = await prisma.users.findMany({
                where: {
                    roles: {
                        some: {
                            roleId: {
                                gt: 0,
                            },
                        },
                    },
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
        },
        "sales-rep"
    );
}
