"use server";

import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

import { DykeFormStepMeta, MultiDyke, ShelfItemMeta } from "../../type";
import { ISalesOrderItemMeta, ISalesOrderMeta } from "@/types/sales";
import { user } from "@/app/(v1)/_actions/utils";
import { salesFormData } from "@/app/(v1)/(loggedIn)/sales/_actions/get-sales-form";
import { generateRandomString, inToFt, safeFormText, sum } from "@/lib/utils";
import dayjs from "dayjs";
import { DykeSalesDoors } from "@prisma/client";

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
                        // where: {
                        //     deletedAt: null,
                        // },
                        include: {
                            doors: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                            door: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                            molding: {
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
            tax: true,
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

    const meta = form.meta as any as ISalesOrderMeta;
    if (!Object.keys(meta).includes("tax")) meta.tax = true;
    const typedForm = {
        ...form,
        meta,
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
            // console.log(item.housePackageTool?.dykeDoorId);

            return {
                ...item,
                housePackageTool: {
                    ...(item.housePackageTool || {}),
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

    let itemArray = items
        ?.filter((item) => {
            if (item.multiDykeUid) return item.multiDyke;
            return true;
        })
        .map(
            (
                { formSteps, shelfItems, housePackageTool, ...itemData },
                itemIndex
            ) => {
                let sectionPrice = 0;
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
                        (shelfItemArray[cid] as any).push({
                            item: s,
                        });
                    sectionPrice += s.totalPrice || 0;
                });
                // item: shelfItem as Omit<DykeSalesShelfItem,'meta'> & {meta: {
                //                 categoryIds: number[]
                //             }},
                // itemData.meta;
                const multiComponent: MultiDyke = {
                    components: {},
                    uid: itemData.multiDykeUid as any,
                    multiDyke: itemData.multiDyke as any,
                };
                multiComponent.primary = ((multiComponent.uid &&
                    multiComponent.multiDyke) ||
                    (!multiComponent.multiDyke && multiComponent.uid)) as any;
                if (multiComponent.primary) multiComponent.rowIndex = itemIndex;
                const _comps = items.filter((item) => {
                    if (item.id == itemData.id) {
                        return true;
                    }
                    if (
                        itemData.multiDyke &&
                        itemData.multiDykeUid == item.multiDykeUid
                    )
                        return true;
                    return false;
                });
                // console.log(
                //     _comps.map((i) => i.housePackageTool.dykeDoorId)
                // );

                _comps.map((item) => {
                    // console.log(item.housePackageTool?.door);
                    // const formStep = item.formSteps.find(
                    //     (d) =>
                    //         d.step?.title == "Door" ||
                    //         d.step?.title == "Moulding"
                    // );
                    const component =
                        item.housePackageTool?.door ||
                        item.housePackageTool?.molding ||
                        (item.meta.doorType == "Services"
                            ? {
                                  title: generateRandomString(4),
                              }
                            : null);

                    const isMoulding = item.housePackageTool?.moldingId != null;

                    let _dykeSizes: any = item.meta._dykeSizes;
                    if (!_dykeSizes) {
                        _dykeSizes = {};
                        item.housePackageTool?.doors?.map((door) => {
                            const dim = door.dimension?.replaceAll('"', "in");

                            _dykeSizes[dim] = {
                                dim,
                                width: inToFt(door.dimension.split(" x ")[0]),
                                checked: true,
                            };
                        });
                    }
                    if (component) {
                        // console.log(item.housePackageTool.door);
                        // item.meta.doo
                        multiComponent.components[
                            safeFormText(component.title)
                        ] = {
                            checked: true,
                            heights: _dykeSizes,
                            itemId: item.id,
                            qty: item.qty,
                            description: item.description as any,
                            // swing: item.swing as any,
                            doorQty: item.qty,
                            unitPrice: item.rate,
                            totalPrice: item.total,
                            toolId: isMoulding
                                ? item.housePackageTool.moldingId
                                : item.housePackageTool.dykeDoorId,
                            _doorForm: item.housePackageTool._doorForm || {},
                            hptId: item.housePackageTool.id as any,
                            doorTotalPrice: item?.housePackageTool
                                ?.totalPrice as any,
                        };
                        sectionPrice +=
                            item?.housePackageTool?.totalPrice ||
                            item.total ||
                            0;
                    }
                });
                // console.log(Object.keys(multiComponent.components));

                const rItem = {
                    opened: true,
                    stepIndex: 0,
                    multiComponent,
                    stillChecked: true,
                    sectionPrice,
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
        );

    if (itemArray?.every((item) => item?.item?.meta?.lineIndex > -1)) {
        // console.log("sorting...");
        itemArray = itemArray.sort(
            (item, item2) =>
                item.item.meta.lineIndex - item2.item.meta.lineIndex
        );
        // console.log(itemArray.map((item) => item.item.meta.lineIndex));
    }
    let footerPrices = ""; //index:type:price|
    itemArray.map((a, i) => {
        footerPrices += `${i}:${a.item.meta.doorType}:${a.sectionPrice}`;
    });
    console.log(footerPrices);

    return {
        // currentItemIndex: 0,
        // currentStepIndex: 0,
        salesRep: salesRep,
        customer,
        shippingAddress,
        billingAddress,
        order: orderData,
        _rawData: order,
        itemArray,
        data: ctx,
        paidAmount,
        footer: {
            footerPrices,
        },
    };
}
