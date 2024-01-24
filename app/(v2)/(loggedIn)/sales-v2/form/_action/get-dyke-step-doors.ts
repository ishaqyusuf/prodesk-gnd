"use server";

import { prisma } from "@/db";
import { IStepProducts } from "../components/dyke-item-step-section";
import { findDoorSvg } from "../../_utils/find-door-svg";
import { DykeProductMeta } from "../../type";

export async function getDykeStepDoors(
    width,
    height,
    qty,
    stepId
): Promise<IStepProducts> {
    const doors = await prisma.dykeShelfProducts.findMany({
        where: {
            title: {
                contains: `${width}x${height}`,
            },
        },
    });
    console.log(doors);
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
                    svg:
                        ((door?.meta as any) || {})?.svg ||
                        findDoorSvg(door.title),
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
