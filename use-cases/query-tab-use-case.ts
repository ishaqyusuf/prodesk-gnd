"use server";

import { prisma } from "@/db";

export async function loadQueryTabsUseCase() {
    const tabs = await prisma.pageTabs.findMany({});
}
