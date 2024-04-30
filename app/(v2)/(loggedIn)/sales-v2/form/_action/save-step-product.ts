"use server";

import { prisma } from "@/db";

import { DykeDoorType } from "../../type";
import { IStepProducts } from "../components/step-items-list/step-items";
export interface SaveStepProductExtra {
    _meta: {
        isMoulding: boolean;
        mouldingCategoryId?: number;
        doorType?: DykeDoorType;
        stepTitle?;
        doorQuery?;
    };
}
type Props = IStepProducts[0] & Partial<SaveStepProductExtra>;
async function saveDykeDoor(data: Props) {
    let door: any = undefined;
    if (data.product.img) {
        delete data.product.meta.svg;
        console.log("svg deleted");
    }
    if (!data.id) {
        door = await prisma.dykeDoors.create({
            data: {
                title: data.product.title as any,
                doorType: data._meta?.doorType,
                query: data._meta?.doorQuery,
                img: data.product.img,
                meta: {},
            },
        });
        console.log(door);
    } else {
        door = await prisma.dykeDoors.update({
            where: { id: data.id },
            data: {
                title: data.product.title as any,
                doorType: data._meta?.doorType,
                query: data._meta?.doorQuery,
                img: data.product.img,
                meta: data.product.meta as any,
            },
        });
    }
    return {
        dykeStepId: data.dykeStepId,
        dykeProductId: door.id,
        id: door.id,
        product: {
            ...door,
            value: door.title,
            meta: {
                ...door.meta,
            },
        },
    };
}
export async function saveStepProduct(data: Props) {
    data.product.value = data.product.title as any;
    if (data._meta?.stepTitle == "Door") return await saveDykeDoor(data);
    const {
        product: { id: prodId, ...productData },
        dykeProductId,
        dykeStepId,
        id,
        _meta,
        ...stepData
    } = data;
    if (!id) {
        if (_meta?.isMoulding && !_meta.mouldingCategoryId) {
            // const d = await prisma.dykeCategories.create({
            //     data: {
            //         title: "Moulding",
            //     },
            // });
            // _meta.mouldingCategoryId = d.id;
        }
        return await prisma.dykeStepProducts.create({
            data: {
                ...stepData,
                product: {
                    create: {
                        ...productData,
                        categoryId: undefined,
                        value: productData.title as any,
                        meta: productData.meta as any,
                        category: !_meta?.isMoulding
                            ? undefined
                            : {
                                  connectOrCreate: {
                                      where: {
                                          title: "Moulding",
                                      },
                                      create: {
                                          title: "Moulding",
                                      },
                                  },
                              },
                        // category: _meta?.mouldingCategoryId
                        //     ? {
                        //           connect: {
                        //               id: _meta?.mouldingCategoryId as any,
                        //           },
                        //       }
                        //     : undefined,
                    },
                },
                step: {
                    connect: {
                        id: dykeStepId,
                    },
                },
                //  product: {
                //     create: {
                //         ...productData as any
                //     }
                //  }
            },
            include: {
                product: true,
            },
        });
    } else
        return await prisma.dykeStepProducts.update({
            where: { id: id },
            data: {
                ...stepData,
                updatedAt: new Date(),
                product: {
                    update: {
                        where: {
                            id: prodId,
                        },
                        data: {
                            ...productData,
                            value: productData.title as any,
                            meta: productData.meta as any,
                        },
                    },
                },
            },
            include: {
                product: true,
            },
        });
}
