"use server";

import { prisma } from "@/db";
import { HousePackageTool, HousePackageToolMeta } from "../type";
import { bifold_door } from "@/lib/community/home-template-builder";
import { inToFt } from "@/lib/utils";

export async function getHousePackageTool(): Promise<HousePackageTool> {
    const s =
        (await prisma.settings.findFirst({
            where: {
                type: "house-package-tools",
            },
        })) ||
        (await prisma.settings.create({
            data: {
                type: "house-package-tools",
                meta: {
                    sizes: [],
                } as any,
                createdAt: new Date(),
            },
        }));
    return {
        id: s.id,
        type: s.type,
        data: await verifyBifoldDoors(s.id, s.meta as any),
    };
}
export async function verifyBifoldDoors(id, data: HousePackageTool["data"]) {
    const b = data.sizes.filter((b) => b.type == "Bifold");
    if (!b.length) {
        //
        const sizes = bifold_door
            .map((d) => d.label)
            .filter((s) => s?.includes("/"));

        const _ = sizes
            .map((s) => {
                return s.replace("/", "-");
            })
            .map((s, i) => {
                // if (i > 0) return;
                let _in =
                    data.sizes.find((d) => s?.startsWith(d.ft))?.in ||
                    inToFt(s);
                // const fa = data.sizes.find((_) => _.ft == "8-0");
                // console.log(fa);
                if (
                    !data.sizes.filter((s) => s.in == _in && s.type == "Bifold")
                ) {
                    data.sizes.push({
                        type: "Bifold",
                        width: true,
                        in: _in,
                        ft: s,
                        height: false,
                    });
                    return true;
                }
                return false;
            });
        if (_.filter(Boolean).length)
            await prisma.settings.update({
                where: {
                    id,
                },
                data: {
                    meta: data as any,
                },
            });
    }

    return data;
}
