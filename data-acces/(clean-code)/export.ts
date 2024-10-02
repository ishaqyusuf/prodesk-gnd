"use server";
import { prisma } from "@/db";
import { TypedExport } from "../../app/(clean-code)/_common/export/type";

export async function getExportConfigs(type) {
    return (await prisma.exportConfig.findMany({
        where: {
            type,
        },
    })) as any as TypedExport[];
}
