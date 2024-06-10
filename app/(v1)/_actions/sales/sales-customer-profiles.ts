"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { CustomerTypes } from "@prisma/client";
import { getPageInfo } from "../action-utils";
import { _cache } from "../_cache/load-data";

export async function staticCustomerProfilesAction() {
    const d = await _cache(
        "customer.types",
        async () => await prisma.customerTypes.findMany({})
    );
    console.log(d);
    return d;
}

export async function saveCustomerProfile(data: CustomerTypes) {
    const { id, ...rest } = data;
    if (!id)
        await prisma.customerTypes.create({
            data: transformData(rest) as any,
        });
    else
        await prisma.customerTypes.update({
            where: { id },
            data: transformData(rest) as any,
        });
}
export async function setCustomerProfileAction(id, profileId) {
    await prisma.customers.update({
        where: {
            id,
        },
        data: {
            profile: {
                connect: {
                    id: profileId,
                },
            },
        },
    });
}
