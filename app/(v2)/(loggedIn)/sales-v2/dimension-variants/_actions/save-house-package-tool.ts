"use server";

import { prisma } from "@/db";

export async function saveHousePackageTool(id, meta) {
    await prisma.settings.update({
        where: { id },
        data: {
            meta,
        },
    });
}
