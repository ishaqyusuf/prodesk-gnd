"use server";

import { prisma } from "@/db";
import { authOptions } from "@/lib/auth-options";
import { ISalesSettingMeta, PostTypes } from "@/types/post";
import { ISalesType, ISalesOrder } from "@/types/sales";
import { CustomerTypes } from "@prisma/client";
import { sum } from "@/lib/utils";
import dayjs from "dayjs";
import { user } from "@/app/(v1)/_actions/utils";

export interface ICreateOrderFormQuery {
    customerId?;
    addressId?;
    type?: ISalesType;
    salesRep?;
    orderId?;
    salesRepId?;
}
export interface SalesFormResponse {
    form: ISalesOrder;
    ctx: SalessalesFormData;
    paidAmount: number;
}
export interface SalessalesFormData {
    settings: ISalesSettingMeta;
    swings: (string | null)[];
    suppliers: (string | null)[];
    profiles: CustomerTypes[];
    defaultProfile: CustomerTypes;
    items: any[];
}
export async function _getSalesFormAction(
    query: ICreateOrderFormQuery
): Promise<SalesFormResponse> {
    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId: query.orderId,
        },
        include: {
            customer: true,
            items: {
                include: {
                    supplies: true,
                },
            },
            salesRep: true,
            billingAddress: true,
            shippingAddress: true,
            payments: {
                select: {
                    // id:true,
                    amount: true,
                },
            },
        },
    });
    if (!order) return await newSalesFormAction(query);
    const { payments, ..._order } = order;
    const ctx = await salesFormData();
    let paidAmount = sum(payments, "amount");
    return {
        form: _order as any,
        ctx: ctx as any,
        paidAmount: paidAmount as any,
    };
}
export async function salesFormData(dyke = false) {
    const setting = await prisma.settings.findFirst({
        where: {
            type: PostTypes.SALES_SETTINGS,
        },
    });
    const meta: ISalesSettingMeta = setting?.meta as any;
    const profiles = await prisma.customerTypes.findMany({
        select: {
            id: true,
            coefficient: true,
            defaultProfile: true,
            title: true,
        },
    });
    if (dyke)
        return {
            settings: meta,
            profiles,
        };
    const extras = await prisma.posts.findMany({
        where: {
            type: {
                in: [PostTypes.SUPPLIERS, PostTypes.SWINGS],
            },
        },
        distinct: ["title"],
        select: {
            type: true,
            title: true,
        },
    });

    const items = await prisma.salesOrderItems.findMany({
        where: {},
        distinct: "description",
        orderBy: {
            updatedAt: "desc",
        },
        select: {
            description: true,
            price: true,
        },
    });
    // console.log(items.length);
    return {
        settings: meta,
        profiles: profiles as any,
        defaultProfile: profiles.find((p) => p.defaultProfile) as any,
        swings: extras
            .filter((e) => e.type == PostTypes.SWINGS)
            .map((e) => e.title),
        suppliers: extras
            .filter((e) => e.type == PostTypes.SUPPLIERS)
            .map((e) => e.title),
        items,
    };
}
async function newSalesFormAction(
    query: ICreateOrderFormQuery
): Promise<SalesFormResponse> {
    const ctx = await salesFormData();

    const session = await user();
    const form = {
        taxPercentage: ctx?.settings?.tax_percentage,
        // salesRepId: query.salesRepId,
        type: query.type,
        status: "Active",
        meta: {
            sales_profile: ctx.defaultProfile?.title,
            sales_percentage: ctx.defaultProfile?.coefficient,
        },
        salesRepId: session?.id,
        salesRep: {
            name: session?.name,
        },
        createdAt: dayjs().toISOString() as any,
    } as ISalesOrder;
    console.log(query);
    if (query.customerId) {
        const customer = await prisma.customers.findFirst({
            where: { id: { equals: +query.customerId } },
            include: {
                profile: true,
                addressBooks: {
                    take: 1,
                    orderBy: {
                        id: "desc",
                    },
                },
            },
        });
        if (customer) {
            form.customerId = customer.id;
            form.meta.sales_profile =
                customer.profile?.title || ctx.settings?.sales_profile;
            form.meta.sales_percentage =
                customer.profile?.coefficient || ctx?.settings?.sales_margin;
            const addr = {
                ...(customer.addressBooks?.[0] || {}),
            } as any;
            form.billingAddressId = form.shippingAddressId = addr?.id;
            form.billingAddress = form.shippingAddress = addr;
        }
    }
    console.log(form);
    return {
        form,
        ctx: ctx as any,
        paidAmount: 0,
    };
}