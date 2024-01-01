"use server";

import { prisma } from "@/db";

export async function getProductionUsersAction() {
    const users = await prisma.users.findMany({
        include: {
            _count: {
                select: {
                    reppedProductions: {
                        where: {
                            // prodDueDate:{}
                            prodStatus: {
                                notIn: ["Completed"]
                            }
                        }
                    }
                }
            }
        },
        where: {
            deletedAt: null,
            roles: {
                some: {
                    role: {
                        name: "Production"
                    }
                }
            }
        }
    });
    console.log(users);
    return users;
}
