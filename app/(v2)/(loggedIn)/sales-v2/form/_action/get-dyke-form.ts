"use server";

import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

import {
    DykeDoorType,
    DykeFormStepMeta,
    MultiDyke,
    ShelfItemMeta,
} from "../../type";
import {
    ISalesOrder,
    ISalesOrderItemMeta,
    ISalesOrderMeta,
} from "@/types/sales";
import { user } from "@/app/(v1)/_actions/utils";
import { salesFormData } from "@/app/(v1)/(loggedIn)/sales/_actions/get-sales-form";
import {
    generateRandomString,
    inToFt,
    removeKeys,
    safeFormText,
    sum,
} from "@/lib/utils";
import dayjs from "dayjs";
import { DykeSalesDoors } from "@prisma/client";

export async function getDykeFormAction(type, slug, restore = false) {
    console.log(restore);

    const restoreQuery = restore
        ? {
              OR: [
                  {
                      deletedAt: null,
                  },
                  {
                      deletedAt: {
                          not: null,
                      },
                  },
              ],
          }
        : {
              deletedAt: null,
          };
    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId: slug || "",
            isDyke: true,
        },
        include: {
            items: {
                where: {
                    ...restoreQuery,
                },

                include: {
                    formSteps: {
                        where: {
                            ...restoreQuery,
                        },
                        include: {
                            step: {},
                        },
                    },
                    shelfItems: {
                        where: {
                            ...restoreQuery,
                        },
                    },
                    housePackageTool: {
                        // where: {
                        //     ...restoreQuery
                        // },
                        include: {
                            doors: {
                                where: {
                                    ...restoreQuery,
                                },
                            },
                            door: {
                                where: {
                                    ...restoreQuery,
                                },
                            },
                            molding: {
                                where: {
                                    ...restoreQuery,
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

    const _meta: Partial<ISalesOrderMeta> = {
        sales_profile: ctx.defaultProfile?.title,
        sales_percentage: ctx.defaultProfile?.coefficient,
        ccc_percentage: +ctx?.settings?.ccc,
        tax: true,
    };
    console.log(ctx.defaultProfile);

    const newOrderForm: Partial<OrderType> = {
        type,
        isDyke: true,
        status: "Active",
        taxPercentage: +ctx.settings?.tax_percentage,
        paymentTerm: ctx.defaultProfile?.meta?.net,
        goodUntil: ctx.defaultProfile?.goodUntil,
        meta: _meta as any,
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
            } as any,
        ],
        salesRep: {
            name: session.name,
            id: session.id,
        },
        createdAt: dayjs().toISOString() as any,
    };
    const form = (order || newOrderForm) as any as OrderType;

    const meta = form.meta as any as ISalesOrderMeta;
    if (!Object.keys(meta).includes("tax")) meta.tax = true;
    const typedForm = removeKeys(
        {
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
        },
        ["deletedAt"] as any,
        true
    );
    const {
        items,
        salesRep,
        customer,
        shippingAddress,
        billingAddress,
        payments,
        ...orderData
    } = typedForm;
    let footerPrices: {
        [id in string]: {
            doorType: DykeDoorType;
            price: number;
            tax?: boolean;
        };
    } = {};
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
                        uid;
                    };
                } = {};
                shelfItems.map((s) => {
                    const cid = s.categoryId?.toString();
                    const uid = generateRandomString(4);
                    if (!shelfItemArray[cid])
                        shelfItemArray[cid] = {
                            productArray: [],
                            categoryIds: s.meta.categoryIds,
                            categoryId: s.categoryId,
                            uid,
                        };
                    // if (copy) {
                    //     delete s.id;
                    //     delete itemData.id;
                    // }
                    if (shelfItemArray[cid])
                        (shelfItemArray[cid] as any)?.productArray?.push({
                            item: s,
                        });
                    sectionPrice += s.totalPrice || 0;
                    footerPrices[uid] = {
                        price: s.totalPrice || 0,
                        doorType: itemData?.meta?.doorType,
                        tax: itemData.meta?.tax,
                    };
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
                // console.log(_comps);

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
                        const uid = generateRandomString(4);
                        function getMouldingId() {
                            let mid = item.housePackageTool.moldingId;
                            console.log(item.housePackageTool.molding?.title);

                            const s = item.formSteps.find(
                                (fs) => fs.step.title == "Moulding"
                            );
                            console.log(mid);

                            if (s) console.log(s?.value);
                            const svid = s?.step?.title;
                            console.log(svid);
                            return mid;
                        }
                        const c = (multiComponent.components[
                            safeFormText(component.title)
                        ] = {
                            uid,
                            checked: true,
                            heights: _dykeSizes,
                            itemId: item.id,
                            qty: item.qty,
                            description: item.description as any,
                            tax: item.meta.tax,
                            production: itemData?.dykeProduction,
                            // swing: item.swing as any,
                            doorQty: item.qty,
                            unitPrice: item.rate,
                            totalPrice: item.total,
                            toolId: isMoulding
                                ? getMouldingId()
                                : item.housePackageTool.dykeDoorId,
                            _doorForm: item.housePackageTool._doorForm || {},
                            hptId: item.housePackageTool.id as any,
                            doorTotalPrice: item?.housePackageTool
                                ?.totalPrice as any,
                        });
                        footerPrices[uid] = {
                            price: c.totalPrice || 0,
                            tax: c.tax,
                            doorType: item.meta.doorType,
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
                    expanded: form.id ? false : true,
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
                    uid: generateRandomString(4),
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

    return {
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
            footerPrices: JSON.stringify(footerPrices),
            footerPricesJson: footerPrices,
        },
    };
}
