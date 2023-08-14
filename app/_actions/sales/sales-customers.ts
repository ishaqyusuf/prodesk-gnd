"use server";

import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import { getPageInfo, queryFilter } from "../action-utils";
import { ICustomer } from "@/types/customers";
import { sum, transformData } from "@/lib/utils";

export interface IGetCustomerActionQuery {}
export async function getCustomersAction(query: IGetCustomerActionQuery) {
  const where: Prisma.CustomersWhereInput = {};
  const _items = await prisma.customers.findMany({
    where,
    ...(await queryFilter(query)),
    include: {
      _count: {
        select: {
          salesOrders: true,
        },
      },
    },
  });

  const pageInfo = await getPageInfo(query, where, prisma.customers);
  return {
    pageInfo,
    data: _items as any,
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
      salesOrders: true,
      _count: {
        select: {
          salesOrders: {},
        },
      },
    },
  });
  if (!_customer) throw new Error("Customer not Found");
  let customer: ICustomer = _customer as any;

  customer._count.totalCost = sum(customer.salesOrders, "grandTotal");
  customer._count.amountDue = sum(customer.salesOrders, "amountDue");
  let pd = (customer._count.pendingDoors = sum(
    customer.salesOrders,
    "builtQty"
  ));
  let td = (customer._count.totalDoors = sum(customer.salesOrders, "prodQty"));
  customer._count.completedDoors = td - pd;
  let pendingCompletion = _customer.salesOrders?.filter(
    (s) => s.prodStatus != "Completed"
  ).length;
  customer._count.pendingOrders = pendingCompletion;
  customer._count.completedOrders = _customer.salesOrders?.filter(
    (s) => s.prodStatus == "Completed"
  ).length;
  customer.salesOrders = customer.salesOrders.slice(-1);
  return { customer };
}

export async function saveCustomer(customer: ICustomer) {
  let id = customer.id;
  if (!id) {
    const { email, name, meta, address, phoneNo } = customer;
    const customerTypeId = await getCustomerProfileId(customer);
    const _customer = await prisma.customers.create({
      data: {
        ...transformData({ email, name, meta, address, phoneNo }),
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
        ...(transformData(customer.primaryAddress) as any),
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
export async function getCustomerProfiles() {
  return await prisma.customerTypes.findMany({});
}
