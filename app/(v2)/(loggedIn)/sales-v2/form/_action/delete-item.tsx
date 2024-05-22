"use server";

import { prisma } from "@/db";
import { Prisma } from "@prisma/client";

export async function _deleteDykeItem(
    itemId,
    {
        stepFormIds = [],
        shelfIds = [],
        doorsIds = [],
        housePackageIds = [],
        itemIds = [],
    } = {}
) {
    async function _deleteWhere(
        itemId,
        t,
        notIn: number[] = [],
        items = false
    ) {
        const where: any = items
            ? { id: itemId }
            : {
                  salesOrderItem: {
                      id: itemId,
                  },
                  id: {
                      notIn: notIn || [],
                  },
              };
        // if (!items)
        //     where.id = {
        //         notIn: notIn || [],
        //     };
        await t.updateMany({
            where,
            data: {
                deletedAt: new Date(),
            },
        });
    }
    return prisma.$transaction(async (tx) => {
        if (itemId) {
            // await prisma.salesOrderItems.updateMany({
            //     where: {
            //         id,
            //     },
            //     data: {
            //         deletedAt: new Date(),
            //     },
            // });
            await _deleteWhere(itemId, tx.dykeStepForm, stepFormIds);

            await _deleteWhere(itemId, tx.dykeSalesShelfItem, shelfIds);

            await _deleteWhere(itemId, tx.dykeSalesDoors, doorsIds);

            await _deleteWhere(itemId, tx.housePackageTools, housePackageIds);
            await _deleteWhere(itemId, tx.salesOrderItems, itemIds, true);
        }
    });
}
