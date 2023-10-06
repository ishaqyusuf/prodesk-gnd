"use server";

import { prisma } from "@/db";
import { revalidatePath } from "next/cache";

export async function updateCommunityModelInstallCost(id, meta) {
    await prisma.communityModels.update({
        where: { id },
        data: {
            meta,
            updatedAt: new Date()
        }
    });
    revalidatePath("/settings/community/community-templates", "page");
}
