"use server";

import { prisma } from "@/db";

export async function harvestCustomers() {
    const customers = await prisma.customers.findMany({
        where: {},
        select: {
            phoneNo: true,
            phoneNo2: true,
            email: true,
            id: true,
            name: true,
        },
    });
    const grouped = customers.reduce((map, customer) => {
        const trimmedPhone = customer.phoneNo?.trim();
        if (trimmedPhone) {
            if (!map.has(trimmedPhone)) {
                map.set(trimmedPhone, []);
            }
            map.get(trimmedPhone).push(customer);
        }
        return map;
    }, new Map());
    const phoneWIthNames = {};
    const filteredGroups = Array.from(grouped.entries()).filter(
        ([phone, group]) => group.length > 1
    );
    filteredGroups.map(([phone, group]) => {
        phoneWIthNames[phone] = group.map((g) => g.name);
        return group;
    });
    return { filteredGroups, phoneWIthNames };
}
export async function customerSynchronize(data) {
    await Promise.all(
        data
            .filter(([phone, customers]) => customers.length)
            .map(async ([phone, customers]) => {
                // Determine the primary customer
                const primaryCustomer =
                    customers.find((customer) => customer.email) ||
                    customers[0];

                // Update non-primary customers
                const updates = customers
                    .filter((customer) => customer.id !== primaryCustomer.id)
                    .map((customer) => {
                        return prisma.customers.update({
                            where: { id: customer.id },
                            data: {
                                phoneNo: null,
                                phoneNo2: customer.phoneNo2 || customer.phoneNo,
                            },
                        });
                    });

                // Execute all updates for the current group
                return Promise.all(updates);
            })
    );
}
