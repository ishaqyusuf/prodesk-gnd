"use server";

import { prisma } from "@/db";
import { actionClient } from "./safe-action";
import { createCustomerSchema } from "./schema";

export const createCustomerAction = actionClient
    .schema(createCustomerSchema)
    .metadata({
        name: "create-customer",
        track: {},
    })
    .action(async ({ parsedInput: { ...input } }) => {
        if (input.id) {
            const customer = await prisma.customers.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    phoneNo: input.phoneNo,
                    phoneNo2: input.phoneNo2,
                    email: input.email,
                    address: input.address_1,
                    businessName: input.businessName,

                    meta: {},
                    profile: {
                        connect: {
                            id: input.profileId,
                        },
                    },
                },
            });
        }
    });
