"use server";

import { prisma } from "@/db";

export type CacheNames =
    | "1099-contractors"
    | "punchouts"
    | "employees"
    | "projects"
    | "job-employees"
    | "install-price-chart";
export async function fetchCache(name: CacheNames, group = null) {
    const c = await prisma.cache.findFirst({
        where: {
            name: `${name}-cache`,
            group,
        },
    });
    if (c) return (c as any).meta.data;
    return null;
}
export async function saveCache(name: CacheNames, data, group) {
    const type = `${name}-cache`;
    const c = await prisma.cache.create({
        data: {
            name: type,
            group,
            meta: {
                data,
            },
            createdAt: new Date(),
        },
    });
    await prisma.cache.deleteMany({
        where: {
            name: type,
            group,
            id: {
                not: c.id,
            },
        },
    });
}
export async function _cache(name: CacheNames | string, fn, group: any = null) {
    console.log("CATCH LOADING");

    const cdata = await fetchCache(name as any, group);
    console.log(cdata);

    if (cdata) return cdata;

    const c = await fn();
    await saveCache(name as any, c, group);
    return c;
}
