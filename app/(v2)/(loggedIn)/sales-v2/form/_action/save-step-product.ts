"use server";

import { prisma } from "@/db";
import { IStepProducts } from "../components/dyke-item-step-section";

export async function saveStepProduct(data: IStepProducts[0]) {
    data.product.value = data.product.title as any;
    const {
        product: { id: prodId, ...productData },
        dykeProductId,
        dykeStepId,
        id,
        ...stepData
    } = data;
    if (!id) {
        return await prisma.dykeStepProducts.create({
            data: {
                ...stepData,
                product: {
                    create: {
                        ...productData,

                        meta: productData.meta as any,
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
