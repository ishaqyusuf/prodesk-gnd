"use server";

import { prisma } from "@/db";

type CacheNames = "1099-contractors" | "punchouts" | "employees" | "projects";
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
export async function _cache(name: CacheNames, fn) {
    const cdata = await fetchCache(name);
    if (cdata) return cdata;

    const c = await fn();
    await saveCache(name, c);
    return c;
}
