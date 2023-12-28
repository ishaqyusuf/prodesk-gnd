"use server";

import { prisma } from "@/db";

export async function _getCustomerSearchList() {
    let items = (
        await prisma.addressBooks.findMany({
            // take: 5,
            distinct: ["name", "address1", "phoneNo"],
            where: {},
            include: {
                customer: {
                    include: {
                        profile: {
                            select: {
                                coefficient: true,
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        })
    ).map((item) => {
        return {
            ...item,
            businessName: item.customer?.businessName,
            search: [item.name, item.phoneNo, item.address1]
                .filter(Boolean)
                .join(" "),
        };
    });
    return {
        items: items.filter(
            (item, index) =>
                items.findIndex(
                    (i) => i.search?.toLowerCase() == item.search?.toLowerCase()
                ) == index
        ),
    };
}
