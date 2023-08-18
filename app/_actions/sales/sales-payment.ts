"use server";

import { prisma } from "@/db";
import { toFixed } from "@/lib/use-number";
import { ISalesOrderMeta, ISalesPayment } from "@/types/sales";

export interface PaymentOrderProps {
  id;
  amountDue;
  amountPaid;
  customerId;
  paymentOption;
  checkNo;
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
