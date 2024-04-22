"use server";

import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

import { DykeFormStepMeta, MultiDyke, ShelfItemMeta } from "../../type";
import { ISalesOrderItemMeta, ISalesOrderMeta } from "@/types/sales";
import { user } from "@/app/(v1)/_actions/utils";
import { salesFormData } from "@/app/(v1)/(auth)/sales/_actions/get-sales-form";
import { inToFt, sum } from "@/lib/utils";
import dayjs from "dayjs";
import { DykeSalesDoors, HousePackageTools } from "@prisma/client";

export async function getDykeFormAction(type, slug) {
    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId: slug || "",
            isDyke: true,
        },
        include: {
            items: {
                where: {
                    deletedAt: null,
                },
                include: {
                    formSteps: {
                        where: {
                            deletedAt: null,
                        },
                        include: {
                            step: {},
                        },
                    },
                    shelfItems: {
                        where: {
                            deletedAt: null,
                        },
                    },
                    housePackageTool: {
                        where: {
                            deletedAt: null,
                        },
                        include: {
                            doors: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                        },
                    },
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
            let _doorForm: { [dimension in string]: DykeSalesDoors } = {};
            let _doorFormDefaultValue: {
                [dimension in string]: { id: number };
            } = {};
            item.housePackageTool?.doors?.map((d) => {
                let dim = d.dimension?.replaceAll('"', "in");
                _doorForm[dim] = { ...d };
                _doorFormDefaultValue[dim] = {
                    id: d.id,
                };
            });
            return {
                ...item,
                housePackageTool: {
                    ...item.housePackageTool,
                    _doorForm,
                    _doorFormDefaultValue,
                },
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

        itemArray: items?.map(
            ({ formSteps, shelfItems, housePackageTool, ...itemData }) => {
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
                        (shelfItemArray[cid] as any).productArray.push({
                            item: s,
                        });
                });
                // item: shelfItem as Omit<DykeSalesShelfItem,'meta'> & {meta: {
                //                 categoryIds: number[]
                //             }},
                // itemData.meta;
                const multiComponent: MultiDyke = {};
                items
                    .filter((item) => {
                        if (item.id == itemData.id) return true;
                        if (
                            itemData.multiDyke &&
                            itemData.multiDykeUid == item.multiDykeUid
                        )
                            return true;
                        return false;
                    })
                    .map((item) => {
                        const formStep = item.formSteps.find(
                            (d) =>
                                d.step?.title == "Door" ||
                                d.step?.title == "Moulding"
                        );
                        const isMoulding = formStep?.step.title == "Moulding";
                        let _dykeSizes: any = item.meta._dykeSizes;
                        if (!_dykeSizes) {
                            _dykeSizes = {};
                            item.housePackageTool.doors?.map((door) => {
                                const dim = door.dimension?.replaceAll(
                                    '"',
                                    "in"
                                );
                                console.log(dim);

                                _dykeSizes[door.dimension] = {
                                    dim,
                                    width: inToFt(
                                        door.dimension.split(" x ")[0]
                                    ),
                                    checked: true,
                                };
                            });
                        }
                        if (formStep) {
                            multiComponent[formStep.value as string] = {
                                checked: true,
                                heights: _dykeSizes,
                                toolId: isMoulding
                                    ? item.housePackageTool.moldingId
                                    : item.housePackageTool.doorId,
                            };
                        }
                    });
                // console.log(multiComponent);
                const rItem = {
                    opened: true,
                    stepIndex: 0,
                    multiComponent,
                    stillChecked: true,
                    item: {
                        ...itemData,
                        housePackageTool,
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
            }
        ),
        data: ctx,
        paidAmount,
    };
}
