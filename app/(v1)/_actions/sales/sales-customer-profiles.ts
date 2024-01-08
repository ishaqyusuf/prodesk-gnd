"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { CustomerTypes } from "@prisma/client";
import { getPageInfo } from "../action-utils";
import { _cache } from "../_cache/load-data";

export async function getCustomerProfiles() {
    const pageInfo = await getPageInfo({}, {}, prisma.customerTypes);

    return {
        pageInfo,
        data: (await prisma.customerTypes.findMany({})) as any,
    };
}
export async function staticCustomerProfilesAction() {
    return await _cache(
        "customer.types",
        async () => await prisma.customerTypes.findMany({})
    );
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
export async function deleteCustomerProfile(id) {
    await prisma.customers.updateMany({
        where: {
            customerTypeId: id,
        },
        data: {
            customerTypeId: null,
        },
    });
    await prisma.customerTypes.delete({
        where: {
            id,
        },
    });
}
export async function makeDefaultCustomerProfile(id) {
    await prisma.customerTypes.updateMany({
        where: {
            defaultProfile: true,
        },
        data: {
            defaultProfile: false,
        },
    });
    await prisma.customerTypes.update({
        where: {
            id,
        },
        data: {
            defaultProfile: true,
        },
    });
}

