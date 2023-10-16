"use server";
import { prisma } from "@/db";
import { queryBuilder } from "@/lib/db-utils";
import { ICustomer } from "@/types/customers";
import { IAddressBook, ISalesAddressForm } from "@/types/sales";
import { CustomerTypes, Prisma } from "@prisma/client";

export async function findAddressAction({ q }: { q: string }) {
    const _contains = {
        contains: q
    };

    // const builder = queryBuilder()
    const where: Prisma.AddressBooksWhereInput = {
        OR: !q
            ? undefined
            : [
                  {
                      name: _contains
                  },
                  {
                      phoneNo: _contains
                  }
              ],
        customerId: {
            not: null
        }
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
                            title: true
                        }
                    }
                }
            }
        }
    });
    // console.log(items);
    return {
        items: items.map(item => {
            return {
                ...item,
                search: `${item.name} ${item.phoneNo} ${item.address1}`
            };
        })
    };
}
export async function saveAddressAction({
    billingAddress,
    shippingAddress,
    profile,
    sameAddress
}: ISalesAddressForm) {
    // console.log({
    //     sameAddress,
    //     billingAddress,
    //     shippingAddress
    // });
    let customerId: number | null;
    const response: {
        customerId?;
        billingAddressId?;
        shippingAddressId?;
        shippingAddress?;
        billingAddress?;
        profileUpdate: {
            profile: CustomerTypes;
            customer: ICustomer;
        };
    } = {} as any;
    function setAddress(index, addr) {
        if (index == 0) {
            if (sameAddress) response.shippingAddress = addr;
            response.billingAddress = addr;
        } else {
            response.shippingAddress = addr;
        }
    }
    await Promise.all(
        [billingAddress, shippingAddress].map(async (_address, index) => {
            // delete (address as any)?.["id"];
            if (sameAddress && index == 1) return;
            let { id, ...address } = _address;
            // delete _address.customerId as any;
            let newId = null;

            const { phoneNo, name, address1 } = address as any;
            const where: Prisma.AddressBooksWhereInput = {
                name,
                phoneNo,
                OR: [
                    {
                        address1
                    },
                    {
                        address1: null
                    }
                ]
                // address1: {
                //   in: [address1, ""],
                // },
            };
            let eAddr = (await prisma.addressBooks.findFirst({
                where
            })) as IAddressBook | null;
            console.log(eAddr);
            if (eAddr) {
                let _update: any = null;
                const columns: (keyof IAddressBook)[] = [
                    "email",
                    "city",
                    "state",
                    "address1"
                ];
                if (
                    eAddr.address1 &&
                    address.address1 &&
                    eAddr.address1 != address.address1
                ) {
                    eAddr = null;
                } else {
                    columns.map(c => {
                        // let eac = eAddr[c];
                        let nac = address?.[c];
                        if (nac) {
                            if (!_update) _update = {};
                            _update[c] = nac;
                        }
                    });
                    if (address?.meta?.zip_code)
                        _update.meta = {
                            ...(eAddr.meta ?? {}),
                            zip_code: address?.meta?.zip_code
                        };
                    setAddress(index, eAddr);
                    if (_update) {
                        const _adr = await prisma.addressBooks.update({
                            where: {
                                id: eAddr.id
                            },
                            data: _update
                        });
                        setAddress(index, _adr);
                    }
                    newId = eAddr.id as any;
                    if (index == 0) {
                        customerId = eAddr.customerId;
                    }
                }
                // return eAddr;
            }
            if (eAddr == null) {
                if (index == 0) {
                    let customer: ICustomer = null as any;
                    if (name && phoneNo) {
                        customer = (await prisma.customers.findFirst({
                            where: {
                                name: name,
                                phoneNo
                            },
                            include: {
                                profile: true
                            }
                        })) as any;

                        if (!customer) {
                            customer = (await prisma.customers.create({
                                data: {
                                    name,
                                    phoneNo,
                                    email: address?.email,
                                    profile: profile?.id
                                        ? {
                                              connect: {
                                                  id: profile.id
                                              }
                                          }
                                        : undefined
                                }
                            })) as any;
                        }
                        address.customerId = customer?.id as any;
                    } else {
                        if (!customer?.profile) {
                            await prisma.customers.update({
                                where: { id: customer.id },
                                data: {
                                    profile: {
                                        connect: profile.id as any
                                    }
                                }
                            });
                        } else {
                            if (customer.customerTypeId != profile.id) {
                                response.profileUpdate = {
                                    profile,
                                    customer
                                };
                            }
                        }
                    }
                    customerId = address?.customerId;
                } else address.customerId = customerId;

                const addr = await prisma.addressBooks.create({
                    data: address as any
                });
                newId = addr.id as any;
                customerId = addr.customerId;
                setAddress(index, addr);
            }
            if (index == 0) {
                response.billingAddressId = newId;
                response.customerId = customerId;
                if (sameAddress) response.shippingAddressId = newId;
            } else response.shippingAddressId = newId;
        })
    );
    // await prisma.addressBooks.deleteMany({
    //   where: {},
    // });
    return response;
}
