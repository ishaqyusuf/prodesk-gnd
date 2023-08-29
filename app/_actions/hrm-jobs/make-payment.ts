"use server";

import { prisma } from "@/db";
import { sum, transformData } from "@/lib/utils";
import { EmployeeProfile, JobPayments } from "@prisma/client";
import { userId } from "../utils";
import { _notifyProdStarted, _notifyWorkerPaymentPaid } from "../notifications";

export async function getPayableUsers() {
  const users = await prisma.users.findMany({
    where: {},
    include: {
      employeeProfile: true,
      jobs: {
        where: {
          paymentId: {
            equals: null,
          },
        },
      },
    },
  });
  return users
    .filter((user) => user.jobs.length > 0)

    .map((user) => {
      const vjobs = user.jobs.filter((j) => !j.paymentId);
      let total = +sum(vjobs, "amount");
      //   if(!total)return null;
      let discountPercentage = user.employeeProfile?.discount || 0;
      let discount = 0;
      if (discountPercentage > 0) discount = (total || 0) * (discount / 100);
      return {
        jobIds: vjobs.map((v) => v.id),
        id: user.id,
        name: user.name,
        subTotal: total,
        discount,
        discountPercentage,
        total: total - discount,
        profile: user.employeeProfile,
      };
    })
    .filter((u) => u != null);
}
interface Props {
  jobIds: number[];
  payment: Partial<JobPayments>;
}
export async function makePayment({ payment, jobIds }: Props) {
  payment.paidBy = await userId();

  const p = await prisma.jobPayments.create({
    data: transformData(payment) as any,
  });
  const jobs = await prisma.tasks.updateMany({
    where: {
      id: {
        in: jobIds,
      },
    },
    data: {
      status: "Paid",
      paymentId: p.id,
      statusDate: new Date(),
    },
  });
  //   jobs.
  await _notifyWorkerPaymentPaid(p, jobs.count);
}
