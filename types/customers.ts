import {
  AddressBooks,
  CustomerTypes,
  Customers,
  SalesPayments,
} from "@prisma/client";
import { ISalesOrder, ISalesPayment } from "./sales";

export interface ICustomer extends Customers {
  profile: CustomerTypes;
  salesOrders: ISalesOrder[];
  payments: ISalesPayment[];
  primaryAddress: AddressBooks;
  addressBook: AddressBooks[];
  _count: {
    salesOrders;
    totalDoors;
    pendingDoors;
    totalCost;
    amountDue;
    pendingOrders;
    completedOrders;
    completedDoors;
  };
}
