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
export async function getCustomerDta(phoneNo) {
    const customer = await prisma.customers.findFirst({
        where: {
            phoneNo,
            OR: [{ name: { not: null } }, { businessName: { not: null } }],
        },
        select: {
            name: true,
            businessName: true,
        },
    });
    return customer;
}
export async function getCustomerNameDta(phoneNo) {
    const customer = await getCustomerDta(phoneNo);
    return (customer?.businessName || customer?.name)?.toUpperCase();
}
export async function getCustomerOverview(phoneNo) {
    const profile = await getCustomerDta(phoneNo);
    const customerInfo = await getCustomerSalesInfo(phoneNo);
}
export async function getCustomerSalesInfo(phoneNo) {
    const salesList = await prisma.salesOrders.findMany({
        where: {
            OR: [
                {
                    customer: { phoneNo },
                },
                {
                    billingAddress: { phoneNo },
                },
                {
                    shippingAddress: { phoneNo },
                },
            ],
        },
        select: {
            id: true,
            amountDue: true,
            type: true,
            orderId: true,
            stat: true,
        },
    });
}
