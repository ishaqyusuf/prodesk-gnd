"use server";

import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
interface IProp {
  // progressableId?;
  // type?;
  // parentId?;
  where: {
    progressableId?;
    progressableType?: ProgressableType;
    parentId?;
    type?: ProgressType;
  }[];
}
export async function getProgress({ where: _where }: IProp) {
  const where: Prisma.ProgressWhereInput = {};

  if (_where.length == 1) {
    // const { progressableId, progressableType, parentId,type } = _where[0];
    Object.entries((_where as any)[0]).map(([k, v]) => (where[k] = v));
  } else {
    where.OR = _where;
  }
  const progress = await prisma.progress.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
  return progress;
}

interface IProgress {
  type?: ProgressType;
  status?;
  description?;
  headline?;
  userId?;
  parentId?;
}
export async function saveProgress(
  progressableType: ProgressableType,
  progressableId,
  progress: IProgress
) {
  await prisma.progress.create({
    data: {
      ...progress,
      progressableId,
      progressableType,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
type ProgressType = "production" | undefined;
type ProgressableType = "SalesOrder" | "SalesOrderItem";
