"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { Tasks } from "@prisma/client";
import { userId } from "../utils";
import { _notifyAdminJobSubmitted } from "../notifications";

export async function createJobAction(data: Tasks) {
  data.status = "Submited";
  data.statusDate = new Date();
  if (!data.userId) data.userId = await userId();

  const job = await prisma.jobs.create({
    data: transformData(data) as any,
    include: {
      user: true,
    },
  });
  _notifyAdminJobSubmitted(job as any);
}
