"use server";

import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

import { DykeFormStepMeta, ShelfItemMeta } from "../../type";
import { ISalesOrderItemMeta, ISalesOrderMeta } from "@/types/sales";
import { user } from "@/app/(v1)/_actions/utils";
import { salesFormData } from "@/app/(v1)/(auth)/sales/_actions/get-sales-form";
import { sum } from "@/lib/utils";
import dayjs from "dayjs";

export async function getDykeFormAction(type, slug) {
    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId: slug || "",
            isDyke: true,
        },
        include: {
            items: {
                include: {
                    formSteps: {
                        include: {
                            step: true,
                        },
                    },
                    shelfItems: true,
                },
            },
            payments: true,
            salesRep: {
                select: {
                    id: true,
                    name: true,
                },
            },
            customer: true,
            shippingAddress: true,
            billingAddress: true,
        },
    });

    let paidAmount = sum(order?.payments || [], "amount");
    type OrderType = NonNullable<typeof order>;
    const rootProds = await getStepForm(1);
    const ctx = await salesFormData(true);
    const session = await user();
    const form = (order || {
        type,
        isDyke: true,
        status: "Active",
        taxPercentage: +ctx.settings?.tax_percentage,
        meta: {
            sales_profile: ctx.defaultProfile?.title,
            sales_percentage: ctx.defaultProfile?.coefficient,
        },
        items: [
            {
                formSteps: [
                    {
                        ...rootProds.item,
                        step: rootProds.step,
                    },
                ],
                shelfItems: [
                    {
                        meta: {},
                    },
                ],
                meta: {},
            },
        ],
        salesRep: {
            name: session.name,
            id: session.id,
        },
        createdAt: dayjs().toISOString() as any,
    }) as any as OrderType;

    const typedForm = {
        ...form,
        meta: form.meta as any as ISalesOrderMeta,
        items: form.items.map((item) => {
            return {
                ...item,
                meta: item.meta as any as ISalesOrderItemMeta,
                formSteps: item.formSteps.map((item) => ({
                    ...item,
                    meta: item.meta as any as DykeFormStepMeta,
                })),
                shelfItems: item.shelfItems.map((item) => ({
                    ...item,
                    meta: item.meta as any as ShelfItemMeta,
                })),
            };
        }),
    };
    const {
        items,
        salesRep,
        customer,
        shippingAddress,
        billingAddress,
        payments,
        ...orderData
    } = typedForm;

    return {
        // currentItemIndex: 0,
        // currentStepIndex: 0,
        salesRep: salesRep,
        customer,
        shippingAddress,
        billingAddress,
        order: orderData,

        itemArray: items?.map(({ formSteps, shelfItems, ...itemData }) => {
            const shelfItemArray: {
                [k in string]: {
                    productArray: {
                        item: (typeof shelfItems)[0];
                    }[];
                    categoryIds: number[];
                    categoryId: number;
                };
            } = {};
            shelfItems.map((s) => {
                const cid = s.categoryId?.toString();
                if (!shelfItemArray[cid])
                    shelfItemArray[cid] = {
                        productArray: [],
                        categoryIds: s.meta.categoryIds,
                        categoryId: s.categoryId,
                    };
                if (shelfItemArray[cid])
                    (shelfItemArray[cid] as any).productArray.push({ item: s });
            });
            // item: shelfItem as Omit<DykeSalesShelfItem,'meta'> & {meta: {
            //                 categoryIds: number[]
            //             }},
            const rItem = {
                opened: true,
                stepIndex: 0,
                item: {
                    ...itemData,
                    formStepArray: formSteps.map(({ step, ...rest }) => ({
                        step,
                        item: rest,
                    })),
                    shelfItemArray: Object.values(shelfItemArray), //shelfItems.map((shelfItem) => ({
                    // productArray
                    // })),
                },
            };
            rItem.stepIndex = rItem.item.formStepArray.length - 1;
            return rItem;
        }),
        data: ctx,
        paidAmount,
    };
}
