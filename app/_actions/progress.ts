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
import { getServerSession } from "next-auth";
import { userId } from "./utils";
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
      userId: await userId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
type ProgressType = "production" | "sales" | undefined;
type ProgressableType = "SalesOrder" | "SalesOrderItem" | "WorkOrder";

export interface TimelineUpdateProps {
  parentId;
  userId;
  note;
  status;
  type;
}
export async function updateTimelineAction(
  progressableType: ProgressableType,
  { parentId, note, status, type }: TimelineUpdateProps
) {
  const session = await getServerSession();
  await saveProgress(progressableType, parentId, {
    headline: note,
    userId: session?.user.id,
    type,
    status,
  });
}
