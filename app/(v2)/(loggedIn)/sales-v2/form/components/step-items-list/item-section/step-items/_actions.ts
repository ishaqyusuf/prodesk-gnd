"use server";

import { prisma } from "@/db";
import { IStepProducts } from ".";
import dayjs from "dayjs";

export async function _deleteStepItem(item: IStepProducts[0]) {
    const resp = await prisma.dykeStepProducts.update({
        where: {
            id: item.id,
        },
        data: {
            deletedAt: new Date(),
            // product: {
            //     // update: {
            //     //     deletedAt: new Date(),
            //     // },
            // },
            // door: {},
        },
        include: {
            product: true,
        },
    });
    // console.log(resp?.deletedAt);
}
export async function _deleteDoorStep(item: IStepProducts[0]) {}

export async function updateStepItemPrice({
    stepProductUid,
    dependenciesUid,
    price,
    dykeStepId,
}) {
    const currentPrice = await prisma.dykePricingSystem.findFirst({
        where: {
            stepProductUid,
            dependenciesUid,
        },
    });
    if (currentPrice)
        await prisma.dykePricingSystem.updateMany({
            where: {
                stepProductUid,
                dependenciesUid,
            },
            data: {
                // price,
                // updatedAt: new Date(),
                deletedAt: new Date(),
            },
        });
    await prisma.dykePricingSystem.create({
        data: {
            dykeStepId,
            stepProductUid,
            dependenciesUid,
            price,
            updatedAt: new Date(),
        },
    });
}
export async function getStepPricings(dependenciesUid, dykeStepId) {
    const pricesByUid = {};
    const prices = (
        await prisma.dykePricingSystem.findMany({
            where: {
                dependenciesUid,
                dykeStepId,
            },
        })
    ).map(({ id, stepProductUid, price }) => {
        pricesByUid[stepProductUid] = price;
        return { stepProductUid, id, price };
    });

    return {
        prices,
        pricesByUid,
    };
}
