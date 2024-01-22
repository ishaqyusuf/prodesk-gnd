"use server";

import { prisma } from "@/db";
import { DykeForm } from "../../type";
import { lastId } from "@/lib/nextId";
import { generateSalesIdDac } from "../../../sales/_data-access/generate-sales-id.dac";

export async function saveDykeSales(data: DykeForm) {
    const tx = await prisma.$transaction(async (tx) => {
        const {
            id,
            customerId,
            shippingAddressId,
            salesRepId,
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
                      customer: connect(id),
                      billingAddress: connect(billingAddressId),
                      shippingAddress: connect(shippingAddressId),
                  } as any,
              })
            : await tx.salesOrders.create({
                  data: {
                      ...(rest as any),
                      ...(await generateSalesIdDac(rest)),
                      updatedAt: new Date(),
                      customer: connect(id),
                      salesRep: connect(salesRepId),
                      billingAddress: connect(billingAddressId),
                      shippingAddress: connect(shippingAddressId),
                  },
              });
        let lastItemId = await lastId(tx.salesOrderItems);
        let lastShelfItemId = await lastId(tx.dykeSalesShelfItem);
        let lastStepFormId = await lastId(tx.dykeStepForm);
        const createItems: any[] = [];
        const createShelfItems: any[] = [];
        const createStepForms: any[] = [];
        const ids = {
            itemIds: [] as number[],
            shelfIds: [] as number[],
            stepFormsIds: [] as number[],
        };
        await Promise.all(
            data.itemArray.map(async (arr, index) => {
                let {
                    formStepArray,
                    shelfItemArray,
                    id: itemId,
                    ...item
                } = arr.item;
                // arr.item.shelfItemArray[0].
                const newItem = !itemId;
                item.meta.lineIndex = index;
                if (!itemId) itemId = ++lastItemId;
                const shelfMode = item.meta.shelfMode;
                if (newItem) {
                    createItems.push({
                        id: itemId,
                        ...item,
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
                                categoryIds,
                                productArray,
                                categoryId,
                            }) => {
                                await Promise.all(
                                    productArray.map(
                                        async ({
                                            item: { id: prodId, ...shelf },
                                        }) => {
                                            const newShelf = !prodId;
                                            if (!prodId)
                                                prodId = ++lastShelfItemId;
                                            shelf.meta.categoryIds =
                                                categoryIds;
                                            shelf.categoryId = categoryId;
                                            shelf.salesOrderItemId = itemId;
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
                                        ...stepForm,
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
        await tx.dykeStepForm.createMany({
            data: createStepForms,
        });
        await tx.salesOrderItems.createMany({
            data: createItems,
        });
        await tx.dykeSalesShelfItem.createMany({
            data: createShelfItems,
        });
        return order;
    });
    return tx;
}
