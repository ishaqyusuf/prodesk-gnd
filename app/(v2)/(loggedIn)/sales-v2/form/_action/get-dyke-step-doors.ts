"use server";

import { prisma } from "@/db";
import { IStepProducts } from "../components/dyke-item-step-section";
import { findDoorSvg } from "../../_utils/find-door-svg";
import { DykeProductMeta } from "../../type";

export async function getDykeStepDoors(
    q,
    omit,
    qty,
    stepId,
    final = false
): Promise<IStepProducts> {
    console.log({ q, omit });
    // console.log({})
    const where = {
        AND: [
            {
                AND: q.map((w) => {
                    // if (Array.isArray(w))
                    //     return {
                    //         OR: w.map((_w) => ({
                    //             title: { contains: _w },
                    //         })),
                    //     };
                    return {
                        title: {
                            contains: w,
                        },
                    };
                }),
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
    };
    let doorType = "dyke";
    let doors = await prisma.dykeProducts.findMany({
        where,
    });
    // console.log(doors.length);
    if (!doors.length) {
        doors = (await prisma.dykeShelfProducts.findMany({
            where,
        })) as any;
        doorType = "shelf";
    }

    const result = doors
        .map((door, index) => {
            let pattern = /\d+-\d+[xX]\d+-\d+\s*/;
            if (!door.title) return null;
            door.title = door.title.replace(pattern, "");
            const _index = doors.findIndex((d) =>
                d?.title?.endsWith(door?.title as any)
            );

            if (_index != index) return null;

            // return null;

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
                    // price: door.unitPrice,
                    meta: {
                        ...findDoorSvg(door.title),
                        ...((door.meta as any) || {}),
                        doorType,
                    },
                },
            };
        })
        .filter((c) => c != null);

    return (
        result
            // .filter(
            //     (r, i) =>
            //         result.findIndex(
            //             (f, j) =>
            //                 r.product.title == f.product.title &&
            //                 r.product.qty == f.product.qty
            //         ) == i
            // )
            .map((prd: any) => {
                return {
                    ...prd,
                    product: {
                        ...prd.product,
                        meta: prd.product.meta as any as DykeProductMeta,
                    },
                };
            }) as any
    );
}
