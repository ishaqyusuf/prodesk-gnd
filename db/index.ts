import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const connectionString = `${env.POSTGRESS_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log:
            env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
    });
// const softDelete = Prisma.defineExtension({
//     name: 'softdelete',
//     model: {
//        salesOrders: {
//         delete: async function (pk, query) {
//         //    return this.update({
//         //     where: {
//         //          id: pk
//         //       },
//         //       data
//         //     }
//        }
//     }
// })
// prisma.$extends(softDelete)
if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
