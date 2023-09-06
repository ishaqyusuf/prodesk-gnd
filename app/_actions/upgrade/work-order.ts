"use server";

import { prisma } from "@/db";
import { removeEmptyValues, slugModel } from "@/lib/utils";
import dayjs from "dayjs";

export async function upgradeRequestDate() {}
export async function upgradeWorkOrder() {
  const workOrders = await prisma.workOrders.findMany({
    where: {
      slug: null,
    },
  });
  const w = workOrders[0];

  await prisma.workOrders.update({
    where: {
      id: w?.id,
    },
    data: {
      slug: await slugModel(
        `${w?.projectName} ${w?.lot} ${w?.block}`,
        prisma.workOrders
      ),
    },
  });
  return { workOrders };

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
