import { prisma } from "@/db";
import { AddressBookMeta } from "../../types";

export async function searchAddressDta(q = null) {
    const items = await prisma.addressBooks.findMany({
        take: q ? 15 : 5,
        distinct: ["name", "phoneNo"],
        where: !q
            ? undefined
            : {
                  OR: [{ name: { contains: q } }, { phoneNo: { contains: q } }],
                  customerId: {
                      not: null,
                  },
              },
        select: {
            customer: {
                select: {
                    businessName: true,
                },
            },
            name: true,
            address1: true,
            id: true,
            phoneNo: true,
        },
    });
    return items.map((s) => {
        return {
            ...s,
            phoneAddress: [s.phoneNo, s.address1]?.filter(Boolean).join("   "),
            isBusiness: s.customer?.businessName != null,
        };
    });
}

export async function getAddressFormDta(id) {
    const address = await prisma.addressBooks.findUnique({
        where: {
            id,
        },
        include: {
            customer: true,
        },
    });
    return {
        ...address,
        meta: address.meta as any as AddressBookMeta,
    };
}
