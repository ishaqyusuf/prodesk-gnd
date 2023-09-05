"use server";

import { prisma } from "@/db";
import { formatDate } from "@/lib/use-day";
import { transformData } from "@/lib/utils";
import { ICostChart } from "@/types/community";
import dayjs from "dayjs";

// export async function deleteModel
export async function saveModelCost(cost: ICostChart, templateId) {
  const { id: _id, parentId, ..._cost } = cost;
  let _c: any = null;
  const title = [
    cost?.startDate ? formatDate(cost?.startDate, "MM/DD/YY") : null,
    cost?.endDate ? formatDate(cost?.endDate, "MM/DD/YY") : "To Date",
  ].join(" - ");
  _cost.title = title;
  _cost.current = cost.endDate
    ? dayjs(cost.endDate).diff(dayjs(), "days") > 0
    : true;
  // _cost.model =
  if (!_id) {
    _c = await prisma.costCharts.create({
      data: transformData({
        ..._cost,
        type: "task-costs",
        template: {
          connect: {
            id: templateId,
          },
        },
      }) as any,
    });
  } else {
    _c = await prisma.costCharts.update({
      where: {
        id: _id,
      },
      data: {
        ..._cost,
      },
    });
  }

  return _c;
}
