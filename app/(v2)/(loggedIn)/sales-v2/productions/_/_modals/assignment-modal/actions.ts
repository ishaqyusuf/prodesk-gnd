"use server";

import { prisma } from "@/db";
import { DykeDoorType } from "../../../../type";

export async function getOrderAssignmentData(id) {
    const order = await prisma.salesOrders.findFirst({
        where: { id },
        include: {
            customer: {
                select: {
                    id: true,
                    businessName: true,
                    name: true,
                },
            },
            productionStatus: true,
            items: {
                where: {
                    salesDoors: {
                        some: {
                            doorType: {
                                in: ["Garage", "Interior"] as DykeDoorType[],
                            },
                        },
                    },
                },
                include: {
                    formSteps: true,
                    assignments: {
                        include: {
                            submissions: true,
                        },
                    },
                },
            },
        },
    });
    if (!order) throw Error("Not found");
    return order;
}
