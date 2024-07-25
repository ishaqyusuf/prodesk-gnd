"use server";

import { prisma } from "@/db";

export async function sortComponents(components: { id; sortIndex }[]) {
    await Promise.all(
        components.map(async (c) => {
            await prisma.dykeStepProducts.update({
                where: {
                    id: c.id,
                },
                data: {
                    sortIndex: c.sortIndex,
                },
            });
        })
    );
}
