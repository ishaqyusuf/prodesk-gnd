"use server";

import { prisma } from "@/db";
import { removeEmptyValues } from "@/lib/utils";
import dayjs from "dayjs";

export async function upgradeRequestDate() {}
export async function upgradeWorkOrder() {
  const workOrders = await prisma.workOrders.findMany({
    where: {},
  });

  await Promise.all(
    workOrders.map(async (a) => {
      let m: any = a.meta ?? {};
      if (Array.isArray(m)) m = {};
      if (a.techId || Object.keys(m).length == 0) return;
      const { tech, ...meta } = m;
      const update: any = {};
      if (a.requestDate)
        update.requestDate = dayjs(a.requestDate).toISOString();
      update.techId = tech?.user_id;
      update.assignedAt = tech?.assigned_at
        ? dayjs(tech.assigned_at).toISOString()
        : null;
      update.meta = removeEmptyValues(meta);
      await prisma.workOrders.update({
        where: { id: a.id },
        data: update,
      });
    })
  );
}
