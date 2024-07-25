"use server";

import { prisma } from "@/db";

export async function sortComponents(components: { id; data }[]) {
    await Promise.all(
        components.map(async (c) => {
            const updateFn = c.data.meta
                ? prisma.dykeDoors.update
                : prisma.dykeStepProducts.update;
            await updateFn({
                where: {
                    id: c.id,
                },
                data: {
                    ...c.data,
                    updatedAt: new Date(),
                },
            });
        })
    );
}
