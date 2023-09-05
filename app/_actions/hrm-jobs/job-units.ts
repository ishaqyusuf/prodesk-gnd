"use server";

import { prisma } from "@/db";
import { IHomeTemplate, IProject } from "@/types/community";
import { HomeJobList } from "@/types/hrm";

export async function getUnitJobs(projectId) {
  const project = await prisma.projects.findFirst({
    where: {
      id: projectId,
    },
    include: {
      homes: {
        include: {
          homeTemplate: true,
          jobs: true,
        },
      },
    },
  });
  const ls: HomeJobList[] = [];
  const proj: IProject = project as any;
  project?.homes?.map((unit) => {
    let template: IHomeTemplate = unit.homeTemplate as any;
    if (!template) return null;
    template.meta.installCosts?.map((cost) => {
      let name = [
        `BLK${unit.block} LOT${unit.lot} (${unit.modelName})`,
        cost.title == "Default" ? "" : cost.title,
      ]
        .filter(Boolean)
        .join(" ");
      if (
        !unit.jobs.find((j) => j.title?.toLowerCase() == name?.toLowerCase())
      ) {
        ls.push({
          id: unit.id,
          name,
          costing: cost,
        });
      }
    });
  }); //.filter(Boolean)
  return {
    homeList: ls.sort(
      (a, b) => a?.name?.localeCompare(b.name) as any
    ) as HomeJobList[],
    addon: proj?.meta?.addon,
  };
}
