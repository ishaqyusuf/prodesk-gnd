import { AddressBooks, CustomerTypes, Customers } from "@prisma/client";
import { ISalesOrder, ISalesPayment } from "./sales";

export interface ICustomer extends Customers {
  profile: CustomerTypes;
  salesOrders: ISalesOrder[];
  payments: ISalesPayment[];
  primaryAddress: AddressBooks;
  addressBooks: AddressBooks[];
  _count: {
    salesOrders;
    totalDoors;
    pendingDoors;
    totalSales;
    amountDue;
    pendingOrders;
    completedOrders;
    completedDoors;
  };
}
