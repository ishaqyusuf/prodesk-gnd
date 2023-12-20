"use server";

import { prisma } from "@/db";

type CacheNames = "1099-contractors";
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
