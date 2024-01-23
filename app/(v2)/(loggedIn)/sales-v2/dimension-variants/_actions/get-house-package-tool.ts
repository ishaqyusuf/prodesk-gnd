"use server";

import { prisma } from "@/db";
import { HousePackageTool, HousePackageToolMeta } from "../type";

export async function getHousePackageTool(): Promise<HousePackageTool> {
    const s =
        (await prisma.settings.findFirst({
            where: {
                type: "house-package-tools",
            },
        })) ||
        (await prisma.settings.create({
            data: {
                type: "house-package-tools",
                meta: {
                    sizes: [],
                } as any,
                createdAt: new Date(),
            },
        }));
    return {
        id: s.id,
        type: s.type,
        data: s.meta as any,
    };
}
