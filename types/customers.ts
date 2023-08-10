import { CustomerTypes, Customers } from "@prisma/client";

export interface ICustomer extends Customers {
  profile: CustomerTypes;
  _count: {
    salesOrders;
  };
}
