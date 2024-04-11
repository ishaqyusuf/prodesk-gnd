"use server";

import { prisma } from "@/db";
import { IStepProducts } from "../components/dyke-item-step-section";
import { findDoorSvg } from "../../_utils/find-door-svg";
import { DykeProductMeta } from "../../type";

export async function getDykeStepDoors({
    q,
    omit,
    qty,
    stepId,
    query,
    doorType = null,
    final = false,
}): Promise<{ result: IStepProducts }> {
    const _doors = await prisma.dykeDoors.findMany({
        where: {
            query,
            doorType,
        },
    });
    if (_doors.length || final) return response(_doors, stepId);
    if (query == "SC Molded") {
        const hcDoors = await prisma.dykeDoors.findMany({
            where: {
                query: "HC Molded",
                doorType,
            },
        });
        await prisma.dykeDoors.createMany({
            data: hcDoors.map(({ id, query: _query, ...rest }) => ({
                ...rest,
                query,
                doorType,
                title: rest.title.replace("HC", "SC"),
            })) as any,
        });

        return await getDykeStepDoors({ q, omit, qty, stepId, query });
    }
    const where = {
        AND: [
            {
                AND: q.map((w) => {
                    if (Array.isArray(w))
                        return {
                            OR: w.map((_w) => ({
                                title: { contains: _w, mode: "insensitive" },
                            })),
                        };
                    return {
                        title: {
                            contains: w,
                            mode: "insensitive",
                        },
                    };
                }),
            },
            {
                AND: omit.map((w) => ({
                    title: {
                        not: {
                            contains: w,
                            mode: "insensitive",
                        },
                    },
                })),
            },
        ],
    };

    let doors = await prisma.dykeProducts.findMany({
        where,
    });

    if (!doors.length) {
        doors = (await prisma.dykeShelfProducts.findMany({
            where,
        })) as any;
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
                title: door.title,
                img: door.img,
                doorType,
                query,
                meta: {},
            };
        })
        .filter(Boolean);
    const res = await prisma.dykeDoors.createMany({
        skipDuplicates: true,
        data: result as any,
    });

    return await getDykeStepDoors({ q, omit, qty, stepId, query, final: true });
}
function response(_doors, stepId) {
    return {
        result: _doors.map((door: any) => {
            return {
                dykeStepId: stepId,
                dykeProductId: door.id,
                id: door.id,
                product: {
                    ...door,
                    value: door.title,
                    meta: {
                        ...findDoorSvg(door.title),
                        ...((door.meta as any) || {}),
                    } as DykeProductMeta,
                },
            };
        }) as any,
    };
}
