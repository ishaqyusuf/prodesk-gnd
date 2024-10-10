"use server";

import { prisma } from "@/db";
import { nextId } from "@/lib/nextId";
import { ICustomer } from "@/types/customers";
import { IAddressBook, ISalesAddressForm } from "@/types/sales";
import { CustomerTypes, Prisma } from "@prisma/client";
import { getCustomerProfileDac } from "./get-customer-profile.dac";
import { ICustomerProfile } from "@/app/(v1)/(loggedIn)/sales/(customers)/customers/profiles/_components/type";
import { sessionIsDealerMode, user } from "@/app/(v1)/_actions/utils";

export async function _saveSalesAddress({
    billingAddress,
    shippingAddress,
    // profile,
    sameAddress,
    customer: _customer,
}: ISalesAddressForm) {
    const dealer = await sessionIsDealerMode();
    let customerId: number | null;
    const response: {
        customerId?;
        customer?;
        billingAddressId?;
        shippingAddressId?;
        shippingAddress?;
        billingAddress?;
        profile: ICustomerProfile;
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
            if (sameAddress && index == 1) return;
            let { id, ...address } = _address;
            let newId = null;

            const { phoneNo, phoneNo2, email, name, address1 } = address as any;
            function _or(k: keyof Prisma.AddressBooksWhereInput, value) {
                return {
                    OR: [
                        {
                            [k]: value,
                        },
                        {
                            [k]: null,
                        },
                    ],
                };
            }
            const where: Prisma.AddressBooksWhereInput = {
                AND: [
                    { name },
                    _or("phoneNo", phoneNo),
                    _or("email", email),
                    _or("address1", address1),
                    {
                        customer: dealer
                            ? {
                                  auth: {
                                      id: dealer.id,
                                  },
                              }
                            : {
                                  isNot: null,
                              },
                    },
                ],
            };
            let eAddr = (await prisma.addressBooks.findFirst({
                where,
                include: {
                    customer: {
                        include: {
                            auth: true,
                        },
                    },
                },
            })) as any as IAddressBook | null;

            if (eAddr) {
                let _update: any = null;
                const columns: (keyof IAddressBook)[] = [
                    "email",
                    "city",
                    "state",
                    "address1",
                ];
                if (
                    eAddr.address1 &&
                    address.address1 &&
                    eAddr.address1 != address.address1
                ) {
                    eAddr = null;
                } else {
                    columns.map((c) => {
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
                    setAddress(index, eAddr);
                    if (_update) {
                        const _adr = await prisma.addressBooks.update({
                            where: {
                                id: eAddr.id,
                            },
                            data: _update,
                        });
                        setAddress(index, _adr);
                    }
                    newId = eAddr.id as any;
                    if (index == 0 && eAddr.customerId) {
                        customerId = eAddr.customerId;

                        const __customer = await prisma.customers.update({
                            where: { id: eAddr.customerId as any },
                            data: {
                                businessName: _customer.businessName,
                            },
                        });
                        address.customerId = eAddr?.customerId;
                        response.customer = __customer;
                    }
                }
            }
            if (eAddr == null) {
                if (index == 0) {
                    let customer: ICustomer = null as any;
                    if (name && phoneNo) {
                        customer = (await prisma.customers.findFirst({
                            where: {
                                name: name,
                            },
                            include: {
                                profile: true,
                                auth: true,
                            },
                        })) as any;

                        if (!customer) {
                            customer = (await prisma.customers.create({
                                data: {
                                    name,
                                    phoneNo,
                                    auth: dealer
                                        ? {
                                              connect: {
                                                  id: dealer.id,
                                              },
                                          }
                                        : undefined,
                                    phoneNo2,
                                    businessName: _customer.businessName,
                                    email: address?.email,
                                },
                                include: {
                                    auth: true,
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
                                    auth: true,
                                },
                            })) as any;
                        address.customerId = customer?.id as any;
                        response.customer = customer;
                    } else {
                        if (!customer?.profile) {
                            await prisma.customers.update({
                                where: { id: customer.id },
                                data: {
                                    profile: {},
                                },
                            });
                        } else {
                        }
                    }
                    customerId = address?.customerId;
                } else address.customerId = customerId;
                const addr = await prisma.addressBooks.create({
                    data: {
                        ...(address as any),
                    },
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
    response.profile = await getCustomerProfileDac(response.customerId);
    return response;
}
