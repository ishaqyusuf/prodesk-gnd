"use server";

import { prisma } from "@/db";
import { itemControlUidObject } from "../../utils/item-control-utils";

export async function getSalesAssignmentsByUidAction(cuid) {
    const uidobjt = itemControlUidObject(cuid);
    const assignments = await prisma.orderItemProductionAssignments.findMany({
        where: {
            OR: [
                {
                    salesItemControlUid: cuid,
                    deletedAt: null,
                },
                {
                    deletedAt: null,
                    salesDoor: uidobjt.doorId
                        ? {
                              dimension: uidobjt.dim || undefined,
                              id: uidobjt.doorId,
                          }
                        : undefined,
                    item: {
                        id: uidobjt.itemId,
                        housePackageTool: uidobjt.hptId
                            ? {
                                  id: uidobjt.hptId,
                              }
                            : undefined,
                    },
                },
            ],
        },
    });
    return {
        uidObj: uidobjt,
        assignments,
    };
}
