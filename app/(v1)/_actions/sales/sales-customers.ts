"use server";

import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
import { ICustomer } from "@/types/customers";
import { sum, transformData } from "@/lib/utils";
import { BaseQuery } from "@/types/action";
import { whereQuery } from "@/lib/db-utils";
import { _cache } from "../_cache/load-data";

export interface IGetCustomerActionQuery extends BaseQuery {}
export async function getCustomersAction(query: IGetCustomerActionQuery) {
    const qb = whereQuery<Prisma.CustomersWhereInput>(query);
    qb.searchQuery("name", "address");
    // qb.raw({})
    const q = { contains: query._q || undefined };

    // console.log(qb.get().OR[0]);

    // const where: Prisma.CustomersWhereInput = {
    //     OR: [
    //         {
    //             name: q,
    //         },
    //         {
    //             address: q,
    //         },
    //     ],
    //     deletedAt: null,

    // };
    const _items = await prisma.customers.findMany({
        where: qb.get(),
        // where: {
        //     name: q,
        // },
        ...(await queryFilter(query)),
        orderBy: {
            // businessName: "asc",
            name: "asc",
        },
        include: {
            profile: true,
            addressBooks: true,
            _count: {
                select: {
                    salesOrders: {
                        where: {
                            deletedAt: null,
                            type: "order",
                        },
                    },
                },
            },
        },
    });

    const pageInfo = await getPageInfo(query, qb.get(), prisma.customers);
    return {
        pageInfo,
        data: _items.map((customer) => {
            let primaryAddress = customer.addressBooks.find(
                (a) => a.id == customer.addressId
            );
            if (!primaryAddress && customer.addressBooks.length > 0)
                primaryAddress = customer.addressBooks[0];
            return {
                ...customer,
                primaryAddress,
            };
        }) as any,
    };
}
export interface ICustomerOverview {
    customer: ICustomer;
}
export async function getCustomerAction(id) {
    const _customer = await prisma.customers.findUnique({
        where: {
            id,
        },
        include: {
            profile: true,
            salesOrders: {
                where: {
                    type: "order",
                    deletedAt: null,
                },
            },
            wallet: true,
            _count: {
                select: {
                    salesOrders: {
                        where: {
                            type: "order",
                            deletedAt: null,
                        },
                    },
                },
            },
        },
    });
    if (!_customer) throw new Error("Customer not Found");
    let customer: ICustomer = _customer as any;

    customer._count.totalSales = sum(customer.salesOrders, "grandTotal");
    customer._count.amountDue = sum(customer.salesOrders, "amountDue");
    let pd = (customer._count.pendingDoors = sum(
        customer.salesOrders,
        "builtQty"
    ));
    let td = (customer._count.totalDoors = sum(
        customer.salesOrders,
        "prodQty"
    ));
    customer._count.completedDoors = (td || 0) - (pd || 0);
    let pendingCompletion = _customer.salesOrders?.filter(
        (s) => s.prodStatus != "Completed"
    ).length;
    customer._count.pendingOrders = pendingCompletion;
    customer._count.completedOrders = _customer.salesOrders?.filter(
        (s) => s.prodStatus == "Completed"
    ).length;
    customer.salesOrders = customer.salesOrders;
    // .slice(
    //   customer.salesOrders.length - 5
    // );
    return { customer };
}

export async function saveCustomer(customer: ICustomer) {
    let id = customer.id;
    if (!id) {
        const { email, name, meta, businessName, phoneNo } = customer;
        const customerTypeId = await getCustomerProfileId(customer);

        const _customer = await prisma.customers.create({
            data: {
                ...transformData({
                    // id: await nextId(prisma.customers),
                    email,
                    name,
                    businessName,
                    meta,
                    address: customer.primaryAddress.address1,
                    phoneNo,
                }),
                profile: customerTypeId
                    ? {
                          connect: {
                              id: Number(customerTypeId),
                          },
                      }
                    : null,
            } as any,
        });
        const _address = await prisma.addressBooks.create({
            data: {
                customerId: _customer.id,
                name: businessName || name,
                ...(transformData(customer.primaryAddress) as any),
                phoneNo,
            },
        });
    }
}
export async function getCustomerProfileId(customer: ICustomer) {
    let id = customer.customerTypeId;
    if (id == -1) {
        const { title, coefficient } = customer.profile || {};
        const profile = await prisma.customerTypes.create({
            data: transformData(
                {
                    title,
                    coefficient: Number(coefficient),
                },
                true
            ) as any,
        });
        return profile.id;
    }

    return id;
}
export async function getStaticCustomers() {
    return await _cache(
        "sales-customers",
        async () => {
            const customers = await prisma.customers.findMany({
                orderBy: {
                    name: "asc",
                },
            });
            return customers;
        },
        "customers"
    );
}
