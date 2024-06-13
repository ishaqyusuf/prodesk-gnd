"use server";

import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { ICustomer } from "@/types/customers";
import { sum, transformData } from "@/lib/utils";
import { BaseQuery } from "@/types/action";
import { _cache } from "../../../_actions/_cache/load-data";
import { paginatedAction } from "@/app/_actions/get-action-utils";

import { ISalesType } from "@/types/sales";
import { InvoicePastDue, ShowCustomerHaving } from "../type";
import dayjs from "dayjs";
import { dateQuery } from "@/app/(v1)/_actions/action-utils";

export interface IGetCustomerActionQuery extends BaseQuery {
    _having: ShowCustomerHaving;
    _due: InvoicePastDue;
}
export async function getCustomersAction(query: IGetCustomerActionQuery) {
    // dateQuery
    const where: Prisma.CustomersWhereInput = {};
    if (query._q)
        where.OR = [
            {
                name: { contains: query._q },
            },
            {
                businessName: { contains: query._q },
            },
        ];
    let to;
    let from = null;
    switch (query._due) {
        case "1-30":
            to = dayjs();
            from = dayjs().subtract(30, "days");
            break;
        case "31-60":
            to = dayjs().subtract(31, "days");
            from = dayjs().subtract(60, "days");
        case "61-90":
            to = dayjs().subtract(61, "days");
            from = dayjs().subtract(90, "days");
            break;
        case ">90":
            to = dayjs().subtract(90, "days");
            from = dayjs().subtract(10, "years");
            break;
    }
    console.log([to, from]);
    const _dateType = "paymentDueDate";
    let dueDateQuery =
        from && to
            ? dateQuery({
                  from,
                  to,
                  _dateType,
              })
            : null;
    if (dueDateQuery)
        where.salesOrders = {
            some: {
                ...dueDateQuery,
            },
        };
    if (!dueDateQuery) dueDateQuery = {};
    if (dueDateQuery) query._having = "Pending Invoice";

    switch (query._having) {
        case "Pending Invoice":
            where.salesOrders = {
                some: {
                    type: "order" as ISalesType,
                    amountDue: {
                        gt: 0,
                    },
                    ...dueDateQuery,
                },
            };
            break;
        case "No Pending Invoice":
            where.salesOrders = {
                every: {
                    amountDue: 0,
                    type: "order" as ISalesType,
                    // ...dueDateQuery,
                },
            };
            break;
    }

    const { pageCount, skip, take } = await paginatedAction(
        query,
        prisma.customers,
        where
    );

    const _items = await prisma.customers.findMany({
        where,
        skip,
        take,
        orderBy: {
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
                            ...dueDateQuery,
                        },
                    },
                },
            },
            salesOrders: {
                where: {
                    type: "order" as ISalesType,
                    amountDue: {
                        gt: 0,
                    },
                    ...dueDateQuery,
                },
                select: {
                    amountDue: true,
                    billingAddress: {
                        select: {
                            phoneNo: true,
                            phoneNo2: true,
                            address1: true,
                        },
                    },
                },
            },
        },
    });

    return {
        pageCount,
        data: _items.map((customer) => {
            let primaryAddress = customer.addressBooks.find(
                (a) => a.id == customer.addressId
            );
            if (!primaryAddress && customer.addressBooks.length > 0)
                primaryAddress = customer.addressBooks[0];
            return {
                ...customer,
                primaryAddress,
                amountDue: sum(customer.salesOrders.map((s) => s.amountDue)),
            };
        }),
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
