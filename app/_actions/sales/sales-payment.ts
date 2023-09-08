"use server";

import { prisma } from "@/db";
import { toFixed } from "@/lib/use-number";
import { ISalesPayment } from "@/types/sales";
import { getCustomerWallet } from "../customer-wallet/wallet";
import {
  creditTransaction,
  debitTransaction,
} from "../customer-wallet/transaction";
import { sum } from "@/lib/utils";

export interface PaymentOrderProps {
  id;
  amountDue;
  amountPaid;
  customerId;
  orderId;
  paymentOption;
  checkNo;
}
export interface ApplyPaymentProps {
  orders: PaymentOrderProps[];
  credit;
  debit;
  balance;
}
export async function applyPaymentAction({
  orders,
  credit,
  debit,
  balance,
}: ApplyPaymentProps) {
  const wallet = await getCustomerWallet(orders[0]?.customerId);
  await creditTransaction(wallet.id, credit);

  const transaction = await debitTransaction(
    wallet.id,
    debit,
    `Payment for order: ${orders.map((o) => o.orderId)}`
  );
  await prisma.salesPayments.createMany({
    data: orders.map(
      (o) =>
        ({
          transactionId: transaction.id,
          amount: +o.amountPaid,
          createdAt: new Date(),
          updatedAt: new Date(),
          orderId: o.id,
          customerId: o.customerId,
          //   order: {
          //     connect: o.orderId,
          //   },
          meta: {
            paymentOption: o.paymentOption,
            checkNo: o.checkNo,
          },
        } as ISalesPayment)
    ),
  });
  await Promise.all(
    orders.map(async ({ id, amountDue }) => {
      await prisma.salesOrders.update({
        where: {
          id,
        },
        data: {
          amountDue,
          updatedAt: new Date(),
        },
      });
    })
  );
  return true;
}
export async function deleteSalesPayment({
  id,
  amount,
  orderId,
  amountDue,
  refund,
}) {
  await prisma.salesPayments.delete({
    where: { id },
  });

  const sales = await prisma.salesOrders.update({
    where: {
      id: orderId,
    },
    data: {
      amountDue,
    },
    include: {
      customer: true,
    },
  });
  const wallet = await getCustomerWallet(sales.customerId);
  await creditTransaction(
    wallet.id,
    refund ? amount : 0,
    refund
      ? `Sales Payment deleted and refunded (${sales.orderId})`
      : `Sales Payment deleted with no refund (${sales.orderId}). $${amount}`
  );
}
export async function fixPaymentAction({
  amountDue,
  id,
}: {
  id: number;
  amountDue: number;
}) {
  await prisma.salesOrders.update({
    where: { id },
    data: {
      amountDue,
    },
  });
}
export async function fixSalesPaymentAction(id) {
  const order = await prisma.salesOrders.findUnique({
    where: {
      id,
    },
    include: {
      payments: true,
    },
  });
  let totalPaid = 0;
  order?.payments?.map((p) => {
    totalPaid += p.amount || 0;
  });

  let amountDue = (order?.grandTotal || 0) - totalPaid;
  await fixPaymentAction({
    id,
    amountDue: +toFixed(amountDue),
  });
}
export async function updatePaymentTerm(id, paymentTerm, goodUntil) {
  await prisma.salesOrders.update({
    where: { id },
    data: {
      paymentTerm,
      goodUntil,
    },
  });
  // const d = await prisma.salesOrders.findUnique({
  //   where: { id },
  // });
  // if (!d) throw new Error("Order Not Found");
  // const meta: ISalesOrderMeta = d.meta as any;
  // meta.pa
}
