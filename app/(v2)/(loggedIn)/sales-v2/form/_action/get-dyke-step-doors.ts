"use server";

import { prisma } from "@/db";
import { findDoorSvg } from "../../_utils/find-door-svg";
import { DykeDoorType, DykeProductMeta } from "../../type";
import { DykeDoors, Prisma } from "@prisma/client";
import { IStepProducts } from "../components/step-items-list/step-items";
interface Props {
    q;
    omit;
    qty;
    stepId;
    query;
    doorType?: DykeDoorType;
    final?: boolean;
}
export async function getDykeStepDoors({
    q,
    omit,
    qty,
    stepId,
    query,
    doorType,
    final = false,
}: Props): Promise<{ result: IStepProducts }> {
    const isBifold = doorType == "Bifold";
    console.log(doorType);

    if (!final) final = isBifold;

    const whereDoor: Prisma.DykeDoorsWhereInput = {
        query: isBifold || !query ? undefined : query,
    };
    // if (!isBifold)
    // if (doorType != "Door Slabs Only")

    whereDoor.OR =
        doorType && !isBifold
            ? undefined
            : [
                  {
                      doorType,
                  },
              ];
    // console.log(whereDoor);

    const _doors = await prisma.dykeDoors.findMany({
        where: whereDoor,
    });

    if (_doors.length || final) {
        const _fd = _doors.filter(
            (d, i) => i == _doors.findIndex((_) => _.title == d.title)
        );
        // console.log(_doors.length, doorType);
        // console.log(_fd.length);
        return response(_fd, stepId);
    }
    if (query == "SC Molded") {
        // console.log("SC Molded");
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
    console.log(res.count);

    return await getDykeStepDoors({ q, omit, qty, stepId, query, final: true });
}
function response(_doors: DykeDoors[], stepId) {
    // _doors[0].q
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
                        ...findDoorSvg(door.title, door.img),
                        ...((door.meta as any) || {}),
                    } as DykeProductMeta,
                },
            };
        }) as any,
    };
}
