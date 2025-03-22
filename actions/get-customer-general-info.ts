"use server";

import { prisma } from "@/db";
import { AsyncFnType } from "@/types";
import { Prisma } from "@prisma/client";

export type CustomerGeneralInfo = AsyncFnType<
    typeof getCustomerGeneralInfoAction
>;
export async function getCustomerGeneralInfoAction(accountNo) {
    const [pref, id] = accountNo?.split("-");

    let where: Prisma.CustomersWhereInput = {
        phoneNo: pref == "cust" ? undefined : accountNo,
        id: pref == "cust" ? id : undefined,
    };
    const customer = await prisma.customers.findFirst({
        where,
        select: {
            id: true,
            name: true,
            businessName: true,
            phoneNo: true,
            email: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const displayName = customer?.businessName || customer?.name;
    return {
        customers: [],
        avatarUrl: null,
        email: customer?.email,
        displayName,
        isBusiness: !!customer?.businessName,
        accountNo,
    };
}
