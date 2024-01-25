"use server";

import { prisma } from "@/db";
import { IStepProducts } from "../components/dyke-item-step-section";
import { findDoorSvg } from "../../_utils/find-door-svg";
import { DykeProductMeta } from "../../type";

export async function getDykeStepDoors(
    q,
    omit,
    qty,
    stepId
): Promise<IStepProducts> {
    console.log({ q, omit });
    // console.log({})
    const doors = await prisma.dykeShelfProducts.findMany({
        where: {
            AND: [
                {
                    AND: q.map((w) => ({
                        title: {
                            contains: w,
                        },
                    })),
                },
                {
                    AND: omit.map((w) => ({
                        title: {
                            not: {
                                contains: w,
                            },
                        },
                    })),
                },
            ],
        },
    });
    // console.log(doors);
    const result = doors.map((door) => {
        return {
            dykeStepId: stepId,
            dykeProductId: door.id,
            id: door.id,

            product: {
                qty,
                title: door.title,
                // img: door.img,
                value: door.title,
                id: door.id,
                price: door.unitPrice,
                meta: {
                    ...findDoorSvg(door.title),
                    ...((door.meta as any) || {}),
                },
            },
        };
    });
    return result
        .filter(
            (r, i) =>
                result.findIndex(
                    (f, j) =>
                        r.product.title == f.product.title &&
                        r.product.qty == f.product.qty
                ) == i
        )
        .map((prd) => {
            return {
                ...prd,
                product: {
                    ...prd.product,
                    meta: prd.product.meta as any as DykeProductMeta,
                },
            };
        }) as any;
}
