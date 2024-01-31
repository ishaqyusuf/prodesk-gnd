"use server";

import { prisma } from "@/db";
import { DykeForm } from "../../type";
import { lastId } from "@/lib/nextId";
import { generateSalesIdDac } from "../../../sales/_data-access/generate-sales-id.dac";
import { DykeSalesDoors, HousePackageTools } from "@prisma/client";

export async function saveDykeSales(data: DykeForm) {
    const tx = await prisma.$transaction(async (tx) => {
        const {
            id,
            customerId,
            shippingAddressId,
            salesRepId,
            pickupId,
            prodId,
            billingAddressId,
            ...rest
        } = data.order;
        function connect(id) {
            return id && { connect: { id } };
        }
        const order = data.order.id
            ? await tx.salesOrders.update({
                  where: { id: data.order.id },
                  data: {
                      ...rest,
                      updatedAt: new Date(),
                      //   customer: connect(customerId),
                      //   salesRep: connect(data.salesRep?.id),
                      //   billingAddress: connect(billingAddressId),
                      //   shippingAddress: connect(shippingAddressId),
                      //   customer: connect(id),
                      //   billingAddress: connect(billingAddressId),
                      //   shippingAddress: connect(shippingAddressId),
                  } as any,
              })
            : await tx.salesOrders.create({
                  data: {
                      ...(rest as any),
                      //   salesRepId: data.salesRep?.id,
                      ...(await generateSalesIdDac(rest)),
                      updatedAt: new Date(),
                      customer: connect(customerId),
                      salesRep: connect(data.salesRep?.id),
                      billingAddress: connect(billingAddressId),
                      shippingAddress: connect(shippingAddressId),
                  },
              });
        let lastItemId = await lastId(tx.salesOrderItems);
        let lastHptId = await lastId(tx.housePackageTools);
        let lastDoorId = await lastId(tx.dykeSalesDoors);
        let lastShelfItemId = await lastId(tx.dykeSalesShelfItem);
        let lastStepFormId = await lastId(tx.dykeStepForm);
        const createItems: any[] = [];
        const createShelfItems: any[] = [];
        const createStepForms: any[] = [];
        const createHpts: Partial<HousePackageTools>[] = [];
        const createDoors: Partial<DykeSalesDoors>[] = [];
        const ids = {
            itemIds: [] as number[],
            shelfIds: [] as number[],
            stepFormsIds: [] as number[],
            doorsIds: [] as number[],
            housePackageIds: [] as number[],
        };
        await Promise.all(
            data.itemArray.map(async (arr, index) => {
                let {
                    formStepArray,
                    shelfItemArray,
                    id: itemId,
                    housePackageTool,
                    ...item
                } = arr.item;
                // arr.item.shelfItemArray[0].
                const newItem = !itemId;
                item.meta.lineIndex = index;
                if (!itemId) itemId = ++lastItemId;
                const shelfMode = !housePackageTool?.doorType;
                if (newItem) {
                    createItems.push({
                        ...item,
                        id: itemId,
                        salesOrderId: order.id,
                    });
                } else {
                    await tx.salesOrderItems.update({
                        where: { id: itemId },
                        data: {
                            ...item,
                            updatedAt: new Date(),
                        } as any,
                    });
                }
                ids.itemIds.push(itemId);
                if (shelfMode) {
                    await Promise.all(
                        shelfItemArray.map(
                            async ({
                                // categoryIds,
                                productArray,
                                // categoryId,
                            }) => {
                                await Promise.all(
                                    productArray.map(
                                        async ({
                                            item: { id: prodId, ...shelf },
                                        }) => {
                                            const newShelf = !prodId;
                                            if (!prodId)
                                                prodId = ++lastShelfItemId;
                                            // shelf.meta.categoryIds =
                                            // categoryIds;
                                            // shelf.categoryId = categoryId;
                                            shelf.salesOrderItemId = itemId;
                                            console.log(shelf);

                                            if (newShelf) {
                                                createShelfItems.push({
                                                    id: prodId,
                                                    ...shelf,
                                                });
                                            } else {
                                                await tx.dykeSalesShelfItem.update(
                                                    {
                                                        where: { id: prodId },
                                                        data: {
                                                            ...shelf,
                                                            updatedAt:
                                                                new Date(),
                                                        } as any,
                                                    }
                                                );
                                            }
                                            ids.shelfIds.push(prodId);
                                        }
                                    )
                                );
                            }
                        )
                    );
                } else {
                    let {
                        id: hptId,
                        doors,
                        _doorForm,
                        _doorFormDefaultValue,
                        ...hptData
                    } = housePackageTool || {};
                    doors = Object.values(_doorForm);
                    console.log(doors);
                    console.log(hptData);

                    if (doors?.length) {
                        const newHpt = !hptId;
                        if (!hptId) hptId = ++lastHptId;
                        hptData.meta = hptData.meta || {};
                        if (newHpt) {
                            createHpts.push({
                                ...hptData,

                                id: hptId,
                                salesOrderId: order.id,
                                orderItemId: itemId,
                            });
                        } else {
                            await tx.housePackageTools.update({
                                where: { id: hptId },
                                data: {
                                    ...(hptData as any),
                                    updatedAt: new Date(),
                                },
                            });
                        }
                        await Promise.all(
                            (doors || [])?.map(async (door) => {
                                if (!door.lhQty && !door.rhQty) return null;
                                door.meta = door.meta || {};
                                console.log("YES DOOR");
                                door.salesOrderId = order.id;
                                door.salesOrderItemId = itemId;
                                let { id: doorId, ...doorData } = door;
                                let newDoor = !doorId;
                                if (newDoor) doorId = ++lastDoorId;
                                // console.log({ doorId, newDoor });
                                if (newDoor)
                                    createDoors.push({
                                        ...doorData,
                                        housePackageToolId: hptId,
                                    });
                                else {
                                    // console.log(doorId);
                                    await tx.dykeSalesDoors.update({
                                        where: { id: doorId },
                                        data: {
                                            ...(doorData as any),
                                            updatedAt: new Date(),
                                        },
                                    });
                                }
                                ids.doorsIds.push(doorId);
                            })
                        );
                        ids.housePackageIds.push(hptId);
                    }
                }
                await Promise.all(
                    formStepArray.map(
                        async ({
                            item: { id: stepFormId, ...stepForm },
                            step,
                        }) => {
                            const newStep = !stepFormId;
                            if (newStep) stepFormId = ++lastStepFormId;
                            stepForm.salesId = order.id;
                            stepForm.salesItemId = itemId;
                            // stepForm.price
                            if (!newStep) {
                                await prisma.dykeStepForm.update({
                                    where: { id: stepFormId },
                                    data: {
                                        ...(stepForm as any),
                                        updatedAt: new Date(),
                                    },
                                });
                            } else {
                                createStepForms.push({
                                    id: stepFormId,
                                    ...stepForm,
                                });
                            }
                            ids.stepFormsIds.push(stepFormId);
                        }
                    )
                );
            })
        );
        console.log(ids.doorsIds);
        console.log({ createDoors });

        await Promise.all(
            [
                {
                    t: tx.salesOrderItems,
                    data: createItems,
                    ids: ids.itemIds,
                    where: { salesOrderId: order.id },
                },
                {
                    t: tx.dykeStepForm,
                    data: createStepForms,
                    ids: ids.stepFormsIds,
                    where: { salesId: order.id },
                },
                {
                    t: tx.dykeSalesShelfItem,
                    data: createShelfItems,
                    ids: ids.shelfIds,
                    where: {
                        salesOrderItem: {
                            salesOrderId: order.id,
                        },
                    },
                },
                {
                    t: tx.housePackageTools,
                    data: createHpts,
                    ids: ids.housePackageIds,
                    where: {
                        salesOrderItem: {
                            salesOrderId: order.id,
                        },
                    },
                },
                {
                    t: tx.dykeSalesDoors,
                    data: createDoors,
                    ids: ids.doorsIds,
                    where: {
                        salesOrderItem: {
                            salesOrderId: order.id,
                        },
                    },
                },
            ].map(async (i) => {
                await (i.t as any).createMany({
                    data: i.data,
                });
                await (i.t as any).deleteMany({
                    where: {
                        id: {
                            notIn: i.ids,
                        },
                        ...i.where,
                    },
                });
            })
        );

        return order;
    });
    return tx;
}
