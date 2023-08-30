"use server";

import { prisma } from "@/db";
import { sum, transformData } from "@/lib/utils";
import { EmployeeProfile, JobPayments } from "@prisma/client";
import { userId } from "../utils";
import { _notifyProdStarted, _notifyWorkerPaymentPaid } from "../notifications";

export async function getPayableUsers(userId) {
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
  const payables = users
    .filter((user) => user.jobs.length > 0)

    .map((user) => {
      const vjobs = user.jobs.filter((j) => !j.paymentId);
      let total = +sum(vjobs, "amount");
      //   if(!total)return null;
      if (user.employeeProfile) {
        console.log("EMPLOYEE PROFILE");
        console.log(user.employeeProfile);
      }
      let discountPercentage = user.employeeProfile?.discount || 0;
      let discount = 0;
      if (discountPercentage > 0)
        discount = (total || 0) * (discountPercentage / 100);
      return {
        jobIds: vjobs.map((v) => v.id),
        id: user.id,
        pid: user.employeeProfileId,
        name: user.name,
        subTotal: total,
        discount,
        discountPercentage,
        total: total - discount,
        profile: user.employeeProfile,
      };
    })
    .filter((u) => u != null);

  const jobs = !userId
    ? []
    : await prisma.jobs.findMany({
        where: {
          paymentId: null,
          userId: Number(userId),
        },
      });
  return {
    payables,
    jobs: {
      data: jobs,
      pageInfo: {},
    },
  };
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
  const jobs = await prisma.jobs.updateMany({
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
