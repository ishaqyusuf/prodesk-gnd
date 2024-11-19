import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export async function loadQueryTabsDta() {
    const tabs = await prisma.pageTabs.findMany({});
}
export async function saveQueryDta(data: Prisma.PageTabsCreateInput) {
    const resp = await prisma.pageTabs.create({
        data,
    });
}
