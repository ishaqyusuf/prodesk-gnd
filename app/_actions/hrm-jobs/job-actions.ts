"use server";

import { prisma } from "@/db";
import { user } from "../utils";

export async function approveJob(jobId) {
  await prisma.jobs.update({
    where: {
      id: jobId,
    },
    data: {
      approvedAt: new Date(),
      approvedBy: (await user()).id,
      updatedAt: new Date(),
      rejectedAt: null,
    },
  });
}
export async function rejectJob(jobId) {
  await prisma.jobs.update({
    where: {
      id: jobId,
    },
    data: {
      rejectedAt: new Date(),
      approvedAt: null,
      // rej: (await user()).id,
      updatedAt: new Date(),
    },
  });
}
export async function updateJobTask(id, meta) {}
