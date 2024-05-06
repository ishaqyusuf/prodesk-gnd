"use server";

import { prisma } from "@/db";

export async function _deleteAssignment(id) {
    await prisma.orderItemProductionAssignments.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
}
