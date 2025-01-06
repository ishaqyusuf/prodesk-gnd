import { AsyncFnType } from "@/app/(clean-code)/type";
import { SearchParamsType } from "@/components/(clean-code)/data-table/search-params";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { whereCustomers } from "../utils/db/where.customer";
import {
    getPageInfo,
    pageQueryFilter,
} from "@/app/(clean-code)/_common/utils/db-utils";
import { SalesType } from "../../types";
import { sum } from "@/lib/utils";

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
export async function getCustomerProfileDta(phoneNo) {
    const customer = await prisma.customers.findFirst({
        where: {
            phoneNo,
            OR: [{ name: { not: null } }, { businessName: { not: null } }],
        },
        select: {
            name: true,
            businessName: true,
            phoneNo: true,
        },
    });
    return {
        displayName: customer.businessName || customer.name,
        isBusiness: customer.businessName != null,
        phoneNo: customer.phoneNo,
    };
}
export async function getCustomerNameDta(phoneNo) {
    const customer = await getCustomerProfileDta(phoneNo);
    return customer?.displayName?.toUpperCase();
}
export async function getCustomerOverviewDta(phoneNo) {
    const profile = await getCustomerProfileDta(phoneNo);
    const customerInfo = await getCustomerSalesInfoDta(phoneNo);
}
export async function getCustomerSalesInfoDta(phoneNo) {
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
            grandTotal: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        // take: 20,
    });
    const orders = salesList.filter((a) => a.type == ("order" as SalesType));
    const quotes = salesList.filter((a) => a.type == ("quote" as SalesType));
    return {
        quotes,
        orders: orders.map((order) => {
            return {
                ...order,
            };
        }),
    };
}
export async function getCustomerPaymentInfo(phoneNo) {
    const orders = await prisma.salesOrders.findMany({
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
            type: "order" as SalesType,
            amountDue: {
                gt: 0,
            },
        },
        select: {
            id: true,
            amountDue: true,
            grandTotal: true,
            type: true,
            orderId: true,
            stat: true,
        },
    });

    const amountDue = sum(orders, "amountDue");
    return {
        amountDue,
        orders,
    };
}
