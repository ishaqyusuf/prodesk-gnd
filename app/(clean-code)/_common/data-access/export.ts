"use server";
import { prisma } from "@/db";
import { TypedExport } from "../export/type";

export async function getExportConfigs(type) {
    return (await prisma.exportConfig.findMany({
        where: {
            type,
        },
    })) as any as TypedExport[];
}
