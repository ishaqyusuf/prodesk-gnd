"use server";

import { prisma } from "@/db";

export async function deleteJobAction(id) {
  //   if (job.paymentId) throw Error("Unable to delete Paid Job");
  await prisma.jobs.delete({
    where: {
      id,
    },
  });
}
