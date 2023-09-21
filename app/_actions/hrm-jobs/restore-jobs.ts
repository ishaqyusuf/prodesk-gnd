"use server";

import { oldSiteJobs } from "@/data/old-site-jobs";
import { prisma } from "@/db";
import { queryBuilder } from "@/lib/db-utils";
import { BaseQuery } from "@/types/action";
import { IJobMeta } from "@/types/hrm";
import { Jobs, Prisma } from "@prisma/client";

export async function getRestorableJobsCount() {
  return await prisma.posts.count({
    where: {
      type: "job-restore",
      status: { not: "restored" },
    },
  });
}
interface Props extends BaseQuery {}
export async function getRestorableJobs(query: Props) {
  const builder = await queryBuilder<Prisma.PostsWhereInput>(
    query,
    prisma.posts
  );
  builder.register("type", "job-restore");

  return builder.response(
    await prisma.posts.findMany({
      where: builder.getWhere(),
      ...builder.queryFilters,
    })
  );
}
export async function insertJobs() {
  const inserts: Jobs[] = oldSiteJobs.map((job) => {
    const ometa = JSON.parse(job.meta || "");
    const meta: IJobMeta = {} as any;
    meta.costData;
    meta.additional_cost = ometa?.additional_cost;
    meta.taskCost;
    const {
      approved_at: approvedAt,
      approved_by: approvedBy,
      admin_note: adminNote,
      description,
      home_id: homeId,
      note,
      status,
      status_date: statusDate,
      subtitle,
      title,
      created_at: createdAt,
      updated_at: updatedAt,
    } = job;
    const coWorkerId = ometa?.co_installer_id;
    return {
      amount: Number(job.amount),
      adminNote,
      approvedAt,
      approvedBy,
      coWorkerId,
      description,
      homeId,
      note,
      status,
      statusDate,
      subtitle,
      title,
      createdAt,
      updatedAt,
      meta,
    } as any;
  });
  console.log(inserts);
}
