"use server";

import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { ICostChart } from "@/types/community";

// export async function deleteModel
export async function saveModelCost(cost: ICostChart, id) {
  const { id: _id, ..._cost } = cost;
  let _c: any = null;
  if (!_id) {
    _c = await prisma.costCharts.create({
      data: transformData({
        ..._cost,
        template: {
          connect: {
            id,
          },
        },
      }) as any,
    });
  } else {
    _c = await prisma.costCharts.update({
      where: {
        id,
      },
      data: {
        ..._cost,
      },
    });
    return _c;
  }
}
