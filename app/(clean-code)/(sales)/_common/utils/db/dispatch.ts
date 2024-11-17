import { Prisma } from "@prisma/client";

export const DispatchListInclude = {
    order: {
        include: {},
    },
} satisfies Prisma.OrderDeliveryInclude;
