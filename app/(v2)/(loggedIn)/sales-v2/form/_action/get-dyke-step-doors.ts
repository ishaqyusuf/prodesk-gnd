"use server";

import { prisma } from "@/db";
import { findDoorSvg } from "../../_utils/find-door-svg";
import { DykeDoorType, DykeProductMeta, StepProdctMeta } from "../../type";
import { DykeDoors, Prisma } from "@prisma/client";
import { IStepProducts } from "../components/step-items-list/item-section/component-products";

import { generateRandomString } from "@/lib/utils";
import { sortStepProducts, transformStepProducts } from "../../dyke-utils";
interface Props {
    q;
    omit;
    qty;
    stepId;
    query;
    doorType?: DykeDoorType;
    final?: boolean;
}

export async function _deleteDuplicateDoorSteps(ids) {
    await prisma.dykeStepProducts.updateMany({
        where: { id: { in: ids } },
        data: {
            deletedAt: new Date(),
        },
    });
}
export async function getDykeStepDoors({
    q,
    omit,
    qty,
    stepId,
    query,
    doorType,
    final = false,
}: Props): Promise<IStepProducts> {
    const isBifold = doorType == "Bifold";
    // console.log(doorType);

    if (!final) final = isBifold;

    const whereDoor: Prisma.DykeDoorsWhereInput = {
        // query: isBifold || !query ? undefined : query,
    };
    async function _load() {
        const stepProds = await prisma.dykeStepProducts.findMany({
            where: {
                door: {
                    ...whereDoor,
                    deletedAt: null,
                },
            },
            include: {
                door: true,
                product: true,
            },
        });
        // if (stepProds.length) {
        const _response = stepProds.map(transformStepProducts);
        return sortStepProducts(_response);
        // }
        return null;
    }
    const _data = await _load();
    // if (_data)
    return _data;
    const _doors = await prisma.dykeDoors.findMany({
        where: whereDoor,
    });
    if (_doors.length) {
        const _fd = _doors
            .sort((a, b) => {
                if (a.img === null && b.img !== null) {
                    return 1; // move a to a higher index (bottom of the list)
                }
                if (a.img !== null && b.img === null) {
                    return -1; // move b to a higher index (bottom of the list)
                }
                return 0; // keep the order unchanged if both are null or non-null
            })
            .filter((d, i) => i == _doors.findIndex((_) => _.title == d.title));
        console.log([_doors.length]);
        console.log("CREATING DOORS> ", _fd.length);
        // return [];

        const createdDoors = await prisma.dykeStepProducts.createMany({
            data: _fd.map((door) => ({
                dykeStepId: stepId,
                meta: {},
                uid: generateRandomString(5),
                doorId: door.id,
            })),
        });
        console.log(createdDoors);

        const _data = await _load();
        if (_data) return _data;
        // await Promise.all(
        //     _fd.map(async (d) => {
        //         await prisma.dykeStepProducts.create({
        //             data: {
        //                 dykeStepId: stepId,
        //                 meta: {},
        //                 uid: generateRandomString(5),
        //             },

        //         });
        //     })
        // );
        // return response(_fd, stepId);
    }
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
        // doorType: doorType ? doorType : undefined,
        AND: !q
            ? undefined
            : [
                  {
                      AND: q.map((w) => {
                          if (Array.isArray(w))
                              return {
                                  OR: w.map((_w) => ({
                                      title: { contains: _w },
                                  })),
                              };
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

    let doors = await prisma.dykeProducts.findMany({
        where,
    });

    if (!doors.length && doorType != "Bifold") {
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
function response(_doors: DykeDoors[], stepId) {
    return {
        result: _doors.map((door: any) => {
            // const meta =
            const prodMeta = {
                ...findDoorSvg(door.title, door.img),
                ...((door.meta as any) || {}),
            } as DykeProductMeta;

            return {
                dykeStepId: stepId,
                dykeProductId: door.id,
                id: door.id,
                isDoor: true,
                sortIndex: prodMeta.sortIndex || null,
                product: {
                    ...door,
                    value: door.title,
                    prodMeta,
                },
            };
        }) as any,
    };
}
export async function getDykeStepDoorByProductId(stepId, productId) {
    const door = await prisma.dykeDoors.findFirst({
        where: { id: productId },
    });
    if (!door) throw Error();
    return response([door], stepId).result[0];
}
