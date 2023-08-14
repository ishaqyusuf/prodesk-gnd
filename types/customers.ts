import {
  AddressBooks,
  CustomerTypes,
  Customers,
  SalesPayments,
} from "@prisma/client";
import { IAddressBook, ISalesOrder, ISalesPayment } from "./sales";

export interface ICustomer extends Customers {
  profile: CustomerTypes;
  salesOrders: ISalesOrder[];
  payments: ISalesPayment[];
  primaryAddress: any;
  addressBook: any[];
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
