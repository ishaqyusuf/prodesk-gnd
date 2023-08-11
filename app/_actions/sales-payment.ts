"use server";

import { prisma } from "@/db";
import { ISalesPayment } from "@/types/sales";

export interface PaymentOrderProps {
  id;
  amountDue;
  amountPaid;
  customerId;
  paymentOption;
}
export interface ApplyPaymentProps {
  orders: PaymentOrderProps[];
}
export async function applyPaymentAction({ orders }: ApplyPaymentProps) {
  console.log(orders);
  await prisma.salesPayments.createMany({
    data: orders.map(
      (o) =>
        ({
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
