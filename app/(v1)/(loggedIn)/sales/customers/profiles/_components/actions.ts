"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { ICustomerProfile } from "./type";
import { getPageInfo, queryFilter } from "@/app/(v1)/_actions/action-utils";
import { paginatedAction } from "@/app/_actions/get-action-utils";

export async function getCustomerProfiles(query = {}) {
    //    const where = wheresalesPayments(query);
    return prisma.$transaction(async (tx) => {
        const where = {};
        const { pageCount, skip, take } = await paginatedAction(
            query,
            tx.customerTypes,
            where
        );
        const data = await tx.customerTypes.findMany({
            where,
            skip,
            take,
        });
        return {
            data: data as any as ICustomerProfile[],
            pageCount,
        };
    });
}
export async function saveCustomerProfile(data: ICustomerProfile) {
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
