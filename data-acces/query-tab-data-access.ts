import { prisma } from "@/db";

export async function loadQueryTabsDta() {
    const tabs = await prisma.pageTabs.findMany({});
}
