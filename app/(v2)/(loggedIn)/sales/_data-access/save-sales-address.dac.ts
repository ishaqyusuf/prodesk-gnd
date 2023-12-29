"use server";

import { prisma } from "@/db";
import { ICustomer } from "@/types/customers";
import { IAddressBook, ISalesAddressForm } from "@/types/sales";
import { CustomerTypes, Prisma } from "@prisma/client";

export async function _saveSalesAddress({
    billingAddress,
    shippingAddress,
    profile,
    sameAddress,
    customer: _customer,
}: ISalesAddressForm) {
    let customerId: number | null;
    const response: {
        customerId?;
        customer?;
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
            console.log(index);
            let { id, ...address } = _address;
            // delete _address.customerId as any;
            let newId = null;

            const { phoneNo, phoneNo2, name, address1 } = address as any;
            const where: Prisma.AddressBooksWhereInput = {
                name,
                phoneNo,
                OR: [
                    {
                        address1,
                    },
                    {
                        address1: null,
                    },
                ],
                customerId: {
                    gt: 0,
                },
                // address1: {
                //   in: [address1, ""],
                // },
            };
            let eAddr = (await prisma.addressBooks.findFirst({
                where,
                include: {
                    customer: true,
                },
            })) as IAddressBook | null;

            if (eAddr) {
                console.log(eAddr);
                let _update: any = null;
                const columns: (keyof IAddressBook)[] = [
                    "email",
                    "city",
                    "state",
                    "address1",
                ];
                console.log(index);
                if (
                    eAddr.address1 &&
                    address.address1 &&
                    eAddr.address1 != address.address1
                ) {
                    console.log(index);
                    eAddr = null;
                    console.log("NULL....");
                } else {
                    console.log(index);
                    columns.map((c) => {
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
                            zip_code: address?.meta?.zip_code,
                        };
                    console.log(index);
                    setAddress(index, eAddr);
                    if (_update) {
                        console.log(index);
                        const _adr = await prisma.addressBooks.update({
                            where: {
                                id: eAddr.id,
                            },
                            data: _update,
                        });
                        console.log(index);
                        setAddress(index, _adr);
                    }
                    newId = eAddr.id as any;
                    if (index == 0 && eAddr.customerId) {
                        console.log(index);
                        console.log(index);
                        customerId = eAddr.customerId;
                        console.log(eAddr.customerId);

                        const __customer = await prisma.customers.update({
                            where: { id: eAddr.customerId as any },
                            data: {
                                businessName: _customer.businessName,
                            },
                        });
                        console.log(index);
                        address.customerId = eAddr?.customerId;
                        response.customer = __customer;
                    }
                }
                console.log(index);
                // return eAddr;
            }
            if (eAddr == null) {
                if (index == 0) {
                    let customer: ICustomer = null as any;
                    if (name && phoneNo) {
                        customer = (await prisma.customers.findFirst({
                            where: {
                                name: name,
                                // phoneNo,
                                // phoneNo2
                            },
                            include: {
                                profile: true,
                            },
                        })) as any;

                        if (!customer) {
                            customer = (await prisma.customers.create({
                                data: {
                                    name,
                                    phoneNo,
                                    phoneNo2,
                                    businessName: _customer.businessName,
                                    email: address?.email,
                                    profile: profile?.id
                                        ? {
                                              connect: {
                                                  id: profile.id,
                                              },
                                          }
                                        : undefined,
                                },
                            })) as any;
                        } else
                            customer = (await prisma.customers.update({
                                where: { id: customer.id },
                                data: {
                                    businessName: _customer.businessName,
                                },
                                include: {
                                    profile: true,
                                },
                            })) as any;
                        address.customerId = customer?.id as any;
                        response.customer = customer;
                        console.log(response);
                    } else {
                        if (!customer?.profile) {
                            await prisma.customers.update({
                                where: { id: customer.id },
                                data: {
                                    profile: {
                                        connect: profile.id as any,
                                    },
                                },
                            });
                        } else {
                            if (customer.customerTypeId != profile.id) {
                                response.profileUpdate = {
                                    profile,
                                    customer,
                                };
                            }
                        }
                    }
                    customerId = address?.customerId;
                } else address.customerId = customerId;

                // address.customerId = "1" as any;
                const addr = await prisma.addressBooks.create({
                    data: address as any,
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
