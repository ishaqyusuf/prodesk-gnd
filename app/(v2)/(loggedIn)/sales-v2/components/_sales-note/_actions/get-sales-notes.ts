"use server";

import { getProgressTypes } from "@/app/(v1)/_actions/progress";
import { prisma } from "@/db";

export async function getSalesNote(salesId) {
    const progressList = await prisma.progress.findMany({
        where: {
            OR: [{ parentId: salesId }, { progressableId: salesId }],
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const progressTypes = await getProgressTypes(
        "SalesOrder",
        "SalesOrderItem"
    );
    const items = (
        await prisma.salesOrderItems.findMany({
            where: { salesOrderId: salesId },

            include: {
                housePackageTool: {
                    include: {
                        door: true,
                        molding: true,
                    },
                },
            },
        })
    ).map((item) => {
        const { door, molding } = item?.housePackageTool || {};
        let label = door?.title || molding?.title || item.description;
        return { label, value: item.id?.toString() };
    });
    items.unshift({
        label: "All Notes",
        value: "-1",
    });
    console.log(progressTypes);

    return {
        items,
        progressList,
        progressTypes,
    };
}
