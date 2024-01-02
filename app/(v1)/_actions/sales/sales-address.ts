"use server";
import { prisma } from "@/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { ICustomer } from "@/types/customers";
import { IAddressBook, ISalesAddressForm } from "@/types/sales";
import { CustomerTypes, Prisma } from "@prisma/client";
import { _email } from "../_email";
import { env } from "@/env.mjs";
import ErrorMail from "@/components/_v1/emails/error-mail";
import { _saveSalesAddress } from "@/app/(v2)/(loggedIn)/sales/_data-access/save-sales-address.dac";

export async function findAddressAction({ q }: { q: string }) {
    const _contains = {
        contains: q,
    };

    // const builder = queryBuilder()
    const where: Prisma.AddressBooksWhereInput = {
        OR: !q
            ? undefined
            : [
                  {
                      name: _contains,
                  },
                  {
                      phoneNo: _contains,
                  },
              ],
        customerId: {
            not: null,
        },
    };

    const items = await prisma.addressBooks.findMany({
        take: 5,
        distinct: ["name", "address1", "phoneNo"],
        where,
        // orderBy: {
        //   customerId: {

        //   }
        // },
        include: {
            customer: {
                // select: {
                //   id: true,
                // },
                include: {
                    profile: {
                        select: {
                            coefficient: true,
                            id: true,
                            title: true,
                        },
                    },
                },
            },
        },
    });
    // console.log(items);
    return {
        items: items.map((item) => {
            return {
                ...item,
                businessName: item.customer?.businessName,
                search: `${item.name} ${item.phoneNo} ${item.address1}`,
            };
        }),
    };
}
export const saveAddressAction = createSafeAction(_saveSalesAddress);