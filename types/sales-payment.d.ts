import { SalesPayments } from "@prisma/client";

export interface ISalesPayment extends SalesPayments {
  meta: {
    ccc;
    ccc_percentage;
    sub_total;
    total_due;
    paymentOption;
  };
}
