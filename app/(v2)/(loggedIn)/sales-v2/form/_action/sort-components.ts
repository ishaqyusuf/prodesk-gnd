"use server";

import { prisma } from "@/db";

export async function sortComponents(components: { id; data }[]) {
    await Promise.all(
        components.map(async (c) => {
            let updateFn;
            if (c?.data?.meta) updateFn = prisma.dykeDoors.update;
            else updateFn = prisma.dykeStepProducts.update;

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
