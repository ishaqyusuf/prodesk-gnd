"use server";

import { prisma } from "@/db";

export async function _getBuilderHomeIds(builderId) {
    const homeIds = await prisma.homes.findMany({
        where: {
            builderId,
        },
        select: {
            id: true,
        },
    });
    return homeIds;
}
