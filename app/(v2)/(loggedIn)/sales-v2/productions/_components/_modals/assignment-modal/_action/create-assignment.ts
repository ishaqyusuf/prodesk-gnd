"use server";

import { userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";

export async function createProdAssignment() {
    const assignedById = await userId();
    // await prisma.orderItemProductionAssignments.create({
    //     data: {
    //         assignedById,

    //     } ,
    // });
}
