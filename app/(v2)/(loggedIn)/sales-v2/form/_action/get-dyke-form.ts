"use server";

import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

import { DykeFormStepMeta, ShelfItemMeta } from "../../type";
import { ISalesOrderItemMeta, ISalesOrderMeta } from "@/types/sales";

export async function getDykeFormAction(slug) {
    const order = await prisma.salesOrders.findUnique({
        where: {
            orderId: slug,
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
        },
    });
    type OrderType = NonNullable<typeof order>;
    const rootProds = await getStepForm(1);
    const form = (order || {
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
            },
        ],
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
    const { items, ...orderData } = typedForm;
    return {
        // currentItemIndex: 0,
        // currentStepIndex: 0,
        order: orderData,
        itemArray: items?.map(({ formSteps, shelfItems, ...itemData }) => {
            const shelfItemArray = {};
            shelfItems.map((s) => {
                const cid = s.categoryId?.toString();
                if (!shelfItemArray[cid])
                    shelfItemArray[cid] = {
                        productArray: [],
                        categoryIds: s.meta.categoryIds,
                        categoryId: s.categoryId,
                    };
                shelfItemArray[cid].productArray.push({ item: s });
            });
            // item: shelfItem as Omit<DykeSalesShelfItem,'meta'> & {meta: {
            //                 categoryIds: number[]
            //             }},
            return {
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
        }),
    };
}
