"use server";

import { userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { IAssignGroupForm } from "../assign-group";
import { OrderItemProductionAssignments } from "@prisma/client";
import { math, sum } from "@/lib/utils";

export async function createProdAssignment(
    data: Partial<OrderItemProductionAssignments>[]
) {
    const assignedById = await userId();

    await prisma.orderItemProductionAssignments.createMany({
        data: data.map((d) => {
            d.assignedById = assignedById;
            d.qtyAssigned = sum([d.lhQty, d.rhQty]);
            d.qtyCompleted = 0;
            return d;
        }) as any,
    });
    console.log("SUCCESS");
    // TODO: Notify new production assigned
}
