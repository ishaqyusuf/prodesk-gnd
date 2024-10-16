"use server";

import { prisma } from "@/db";
import { getStepForm } from "./get-dyke-step";

import {
    DykeDoorType,
    DykeFormStepMeta,
    DykeProductMeta,
    DykeSalesDoor,
    MultiDyke,
    ShelfItemMeta,
    StepProdctMeta,
} from "../../type";
import {
    HousePackageToolMeta,
    ISalesOrderItemMeta,
    ISalesOrderMeta,
    ISalesType,
    SalesStatus,
} from "@/types/sales";
import { dealerSession, serverSession, user } from "@/app/(v1)/_actions/utils";
import { salesFormData } from "@/app/(v1)/(loggedIn)/sales/_actions/get-sales-form";
import {
    generateRandomString,
    inToFt,
    removeKeys,
    safeFormText,
    sum,
} from "@/lib/utils";
import dayjs from "dayjs";
import { isComponentType } from "../../overview/is-component-type";
import { includeStepPriceCount } from "../../dyke-utils";

import { salesTaxForm } from "@/app/(clean-code)/(sales)/_common/data-access/sales-tax.persistent";
import { ComponentPrice } from "@prisma/client";
import { withDeleted } from "@/app/(clean-code)/_common/utils/db-utils";

export async function getDykeFormAction(type: ISalesType, slug, query?) {
    const restore = query?.restore == "true";
    const auth = await serverSession();
    const dealerMode = await dealerSession();
    const dealer = dealerMode
        ? await prisma.dealerAuth.findFirst({
              where: {
                  id: auth.user.id,
              },
              include: {
                  primaryBillingAddress: true,
                  primaryShippingAddress: true,
                  dealer: {
                      include: {
                          addressBooks: true,
                      },
                  },
              },
          })
        : null;
    if (dealer) {
        // return null;
    }
    const restoreQuery = restore
        ? withDeleted
        : {
              deletedAt: null,
          };

    const order = await prisma.salesOrders.findFirst({
        where: {
            orderId: slug || "",
            isDyke: true,
        },
        include: {
            salesProfile: true,
            items: {
                where: {
                    ...restoreQuery,
                },
                include: {
                    formSteps: {
                        where: {
                            ...withDeleted,
                            // ...restoreQuery,
                        },

                        include: {
                            priceData: true,
                            step: {
                                include: {
                                    _count: includeStepPriceCount,
                                },
                            },
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
                            priceData: true,
                            stepProduct: {
                                include: {
                                    door: true,
                                },
                            },
                            doors: {
                                include: {
                                    priceData: true,
                                },
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
            taxes: {
                where: {
                    deletedAt: null,
                },
            },
            customer: true,
            shippingAddress: true,
            billingAddress: true,
        },
    });
    // console.log(order.items.length);

    let paidAmount = sum(order?.payments || [], "amount");
    type OrderType = NonNullable<typeof order>;

    const stepProdsUid = order?.items
        ?.map((item) => item.formSteps.map((fs) => fs.prodUid))
        .flat()
        .filter(Boolean);
    const stepProds = (
        await prisma.dykeStepProducts.findMany({
            where: {
                uid: {
                    in: Array.from(new Set(stepProdsUid)),
                },
            },
        })
    ).map((prod) => {
        return {
            ...prod,
            meta: prod.meta as any as StepProdctMeta,
        };
    });
    const rootProds = await getStepForm(1);
    const ctx = await salesFormData(true);
    const session = await user();

    const _meta: Partial<ISalesOrderMeta> = {
        // sales_profile: ctx.defaultProfile?.title,
        sales_percentage: ctx.defaultProfile?.coefficient,
        ccc_percentage: +ctx?.settings?.ccc,
        tax: true,
        calculatedPriceMode: true,
    };

    // console.log({ goodUntil: dayjs(ctx.profiles[0].goodUntil).toISOString() });
    let goodUntil = ctx.defaultProfile?.goodUntil;

    if (goodUntil && typeof goodUntil != "string")
        goodUntil = dayjs(goodUntil).toISOString();
    // console.log({ goodUntil });

    const newOrderForm: Partial<OrderType> = {
        type,
        isDyke: true,
        customerId: dealer?.dealerId,
        customerProfileId: ctx.defaultProfile.id,
        shippingAddress: dealer?.primaryShippingAddress || ({} as any),
        billingAddress: dealer?.primaryBillingAddress || ({} as any),
        salesProfile: ctx.defaultProfile as any,
        status: dealerMode ? "Evaluating" : "Active",
        taxPercentage: +ctx.settings?.tax_percentage,
        paymentTerm: ctx.defaultProfile?.meta?.net,
        goodUntil,
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
        salesRep: dealerMode
            ? ({} as any)
            : {
                  name: session.name,
                  id: session.id,
              },
        createdAt: dayjs().toISOString() as any,
    };
    // newOrderForm.salesProfile.
    // const {} = order;
    const { taxes = [], ...form } = (order || newOrderForm) as any as OrderType;

    const meta = form.meta as any as ISalesOrderMeta;
    if (!Object.keys(meta).includes("tax")) meta.tax = true;
    const typedForm = removeKeys(
        {
            ...form,
            meta,
            items: form.items.map((item) => {
                let _doorForm: {
                    [dimension in string]: DykeSalesDoor;
                    // OrderType["items"][number]["housePackageTool"]["doors"][number];
                } = {};
                let _doorFormDefaultValue: {
                    [dimension in string]: { id: number };
                } = {};
                const isType = isComponentType(
                    item.housePackageTool?.doorType as any
                );
                item.housePackageTool?.doors?.map((d) => {
                    if (d.rhQty && !isType.multiHandles) d.rhQty = 0;
                    let dim = d.dimension?.replaceAll('"', "in");
                    if (!d.priceId)
                        d.priceData = {
                            baseUnitCost: d.jambSizePrice,
                        } as any;
                    _doorForm[dim] = { ...d } as any;
                    _doorFormDefaultValue[dim] = {
                        id: d.id,
                    };
                });
                return {
                    ...item,
                    housePackageTool: item.housePackageTool
                        ? {
                              ...(item.housePackageTool || {}),
                              meta: (item?.housePackageTool?.meta ||
                                  {}) as any as HousePackageToolMeta,
                              _doorForm,
                              _doorFormDefaultValue,
                              stepProduct: item.housePackageTool.stepProduct
                                  ? {
                                        ...(item.housePackageTool.stepProduct ||
                                            {}),
                                        meta: item.housePackageTool.stepProduct
                                            ?.meta as StepProdctMeta,
                                        door: {
                                            ...(item.housePackageTool
                                                .stepProduct.door || {}),
                                            meta: item.housePackageTool
                                                ?.stepProduct?.door
                                                ?.meta as any as DykeProductMeta,
                                        },
                                    }
                                  : undefined,
                          }
                        : undefined,
                    meta: item.meta as any as ISalesOrderItemMeta,
                    formSteps: item.formSteps
                        .map((item) => ({
                            ...item,
                            meta: item.meta as any as DykeFormStepMeta,

                            step: {
                                ...item.step,
                                meta: item.step.meta || {},
                            },
                        }))
                        .filter(
                            (f, fi) =>
                                item.formSteps.findIndex(
                                    (p) => p.stepId == f.stepId
                                ) == fi
                        ),
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
        salesProfile,
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
                // console.log(formSteps.length);

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
                _comps.map((item) => {
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
                                dimFt: inToFt(door.dimension),
                                width: inToFt(door.dimension.split(" x ")[0]),
                                checked: true,
                            };
                        });
                    }
                    if (component) {
                        const uid = generateRandomString(4);
                        function getMouldingId() {
                            let mid = item.housePackageTool.moldingId;

                            return mid;
                        }
                        const price =
                            item?.housePackageTool?.totalPrice ||
                            item.total ||
                            0;

                        const safeTitle = safeFormText(component.title);
                        let priceTags = item.housePackageTool?.meta?.priceTags;
                        if (!priceTags) {
                            priceTags = {};
                            if (isMoulding) {
                                // console.log(item.rate);
                                priceTags = {
                                    moulding: {
                                        price: 0,
                                        addon: item.rate,
                                    },
                                };
                            }
                        }
                        const c = (multiComponent.components[safeTitle] = {
                            uid,
                            checked: true,
                            heights: _dykeSizes,
                            itemId: item.id,
                            qty: item.qty,
                            description: item.description as any,
                            tax: item.meta.tax,
                            production: itemData?.dykeProduction,
                            doorQty: item.qty,
                            unitPrice: item.rate,
                            totalPrice: price,
                            toolId: isMoulding
                                ? getMouldingId()
                                : item.housePackageTool?.dykeDoorId,
                            _doorForm:
                                item.housePackageTool?._doorForm ||
                                ({
                                    priceData: {},
                                } as any),
                            hptId: item.housePackageTool?.id as any,
                            mouldingPriceData:
                                item?.housePackageTool?.priceData ||
                                ({} as any),
                            doorTotalPrice: price,
                            priceTags,
                            stepProductId: item.housePackageTool?.stepProductId,
                            stepProduct: item.housePackageTool
                                ?.stepProduct as any,
                        });

                        footerPrices[uid] = {
                            price: c.totalPrice || 0,
                            tax: c.tax,
                            doorType: item.meta.doorType,
                        };
                        sectionPrice += price;
                    }
                });
                // console.log(Object.keys(multiComponent.components));
                const stepSequence: {
                    [uid in string]: StepProdctMeta["stepSequence"];
                } = {};
                formSteps.map((s, i) => {
                    const seq = stepProds.find((sq) => sq.uid == s.prodUid);
                    if (seq?.meta?.stepSequence) {
                        stepSequence[seq.uid] = seq.meta?.stepSequence;
                    }
                });
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
                    stepSequence,
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
    const fsids = form.items.map((i) => i.formSteps.map((f) => f.id)).flat();
    const ids = itemArray
        .map((a) => a.item.formStepArray.map((f) => f.item.id))
        .flat();

    const deleteSteps = fsids.filter((id) => ids.indexOf(id) < 0);

    if (deleteSteps.length)
        await prisma.dykeStepForm.updateMany({
            where: {
                id: { in: deleteSteps },
            },
            data: {
                deletedAt: new Date(),
            },
        });
    const footer = {
        footerPrices: JSON.stringify(footerPrices),
        footerPricesJson: footerPrices,
    };
    const _refresher: {
        [token in string]: {
            components: string;
        };
    } = {};
    const batchSetting: {
        [token in string]: {
            selections: {
                [token in string]: boolean;
            };
        };
    } = {};
    return {
        salesRep: salesRep,
        customer,
        dealerMode,
        superAdmin: auth.user.id == 1,
        adminMode: true,
        shippingAddress,
        billingAddress,
        salesProfile,
        order: orderData,
        // salesCoefficient:
        // currentSalesProfileCoefficient: ctx.profiles.find(p => p.title ==)
        _rawData: { ...order, footer, formItem: itemArray },
        itemArray,
        data: ctx,
        _taxForm: await salesTaxForm(
            taxes as any,
            order?.id,
            ctx?.defaultProfile?.meta?.taxCode
        ),
        // taxes: taxes,
        // taxByCode: taxByCode(taxes),
        paidAmount,
        footer,
        _refresher,
        batchSetting,
        status: order?.status as SalesStatus,
    };
}
