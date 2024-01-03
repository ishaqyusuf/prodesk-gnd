"use server";

import { prisma } from "@/db";

export type CacheNames =
    | "1099-contractors"
    | "punchouts"
    | "employees"
    | "projects"
    | "job-employees"
    | "install-price-chart";
export async function fetchCache(name: CacheNames) {
    const c = await prisma.posts.findFirst({
        where: {
            type: `${name}-cache`,
        },
    });
    if (c) return (c as any).meta.data;
    return null;
}
export async function saveCache(name: CacheNames, data) {
    const type = `${name}-cache`;
    const c = await prisma.posts.create({
        data: {
            type,
            meta: {
                data,
            },
            createdAt: new Date(),
        },
    });
    await prisma.posts.deleteMany({
        where: {
            type,
            id: {
                not: c.id,
            },
        },
    });
}
export async function _cache(name: CacheNames | string, fn) {
    const cdata = await fetchCache(name as any);
    if (cdata) return cdata;

    const c = await fn();
    await saveCache(name as any, c);
    return c;
}
