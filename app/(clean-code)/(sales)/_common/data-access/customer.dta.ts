import { AsyncFnType } from "@/app/(clean-code)/type";
import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { whereCustomers } from "../utils/db/where.customer";
import {
    getPageInfo,
    pageQueryFilter,
} from "@/app/(clean-code)/_common/utils/db-utils";

export type CustomersQueryParams = Pick<SearchParamsType, "_q" | "address">;
export type GetCustomersDta = AsyncFnType<typeof getCustomersDta>;

export async function getCustomersDta(query: CustomersQueryParams) {
    const where = whereCustomers(query);

    const data = await prisma.customers.findMany({
        where,
        ...pageQueryFilter(query),
        include: {},
    });
    const pageInfo = await getPageInfo(query, where, prisma.customers);
    return {
        ...pageInfo,
        data,
    };
}
export async function updateCustomerEmailDta(id, email) {
    if (!id) throw new Error("Customer id is required");
    await prisma.customers.update({
        where: {
            id,
        },
        data: {
            email,
        },
    });
}
export async function saveCustomerDta(data: Prisma.CustomersCreateInput) {
    const customer = await prisma.customers.upsert({
        where: {
            phoneNo: data.phoneNo,
        },
        create: data,
        update: {
            businessName: data.businessName || undefined,
            email: data.email || undefined,
            name: data.name || undefined,
            phoneNo2: data.phoneNo2 || undefined,
        },
    });

    return customer;
}
