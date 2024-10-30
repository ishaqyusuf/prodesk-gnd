import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { salesAssignmentCreated } from "./sales-progress.dta";

export async function createItemAssignmentDta(
    data: Prisma.OrderItemProductionAssignmentsCreateInput
) {
    data.qtyAssigned = sum([data.lhQty, data.rhQty]);
    const assignment = await prisma.orderItemProductionAssignments.create({
        data,
    });
    await salesAssignmentCreated(data.order.connect.id, data.qtyAssigned);
}
