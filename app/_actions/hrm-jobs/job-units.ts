"use server";

import { prisma } from "@/db";
import { deepCopy } from "@/lib/deep-copy";
import {
    ExtendedHome,
    HomeTemplateMeta,
    ICommunityTemplate,
    IHome,
    IHomeTemplate,
    IProject,
    InstallCost
} from "@/types/community";
import { HomeJobList } from "@/types/hrm";

export async function getJobCostData(id, title) {
    const home = await prisma.homes.findUnique({
        where: { id },
        include: {
            homeTemplate: true
        }
    });
    const template: HomeTemplateMeta = home?.homeTemplate?.meta as any;
    if (template) {
        let spl = title?.split(")")[1]?.trim();
        if (!spl) spl = "Default";
        // return template.installCosts;
        return (
            template.installCosts
                ?.map(i => {
                    if (!i.title) i.title = "Default";
                    if (i.title == spl) return i.costings;
                    return null;
                })
                .filter(Boolean)[0] || {}
        );
        // return template.installCosts[0];
    }
    return {};
}
export async function getUnitJobs(projectId) {
    const project = await prisma.projects.findFirst({
        where: {
            id: projectId
        },
        include: {
            communityModels: true,
            homes: {
                include: {
                    homeTemplate: true,
                    jobs: true
                }
            }
        }
    });
    const ls: HomeJobList[] = [];
    const proj: IProject = project as any;
    // console.log(proj.meta);
    // console.log(project?.homes.length);
    project?.homes?.map(unit => {
        let template: IHomeTemplate = unit.homeTemplate as any;
        let communityTemplate: ICommunityTemplate = project.communityModels.find(
            m => m.modelName == unit.modelName
        ) as any;
        // console.log(unit.modelName);
        // if (unit.modelName?.toLowerCase() == "1329 RH") {
        //     console.log(communityTemplate);
        // }
        // console.log("...");
        const cost = communityTemplate?.meta?.installCosts?.[0];
        cost?.costings;
        // console.log(cost);
        if (cost && Object.values(cost?.costings)?.filter(Boolean).length > 3) {
            ls.push(initJobData(unit as any, proj, cost));
            return;
        }
        if (!template) {
            const cost = proj.meta.installCosts?.[0];
            console.log(cost);
            if (cost) ls.push(initJobData(unit as any, proj, cost));
            return;
        }
        // console.log(template.meta.installCosts);
        template.meta.installCosts?.map(cost => {
            // console.log(cost);
            ls.push(initJobData(unit as any, proj, cost));
        });
    }); //.filter(Boolean)
    return {
        homeList: ls
            .filter(Boolean)
            .sort(
                (a, b) => a?.name?.localeCompare(b.name) as any
            ) as HomeJobList[],
        addon: proj?.meta?.addon
    };
}
function initJobData(unit: ExtendedHome, project: IProject, cost: InstallCost) {
    const costing = deepCopy<InstallCost>(cost);
    // console.log(".....");
    const masterCosting = project?.meta?.installCosts?.[0]?.costings;
    // console.log(".....");
    if (masterCosting) {
        // console.log(".....");
        Object.entries(costing.costings).map(([k, v]) => {
            // console.log(".....");
            const mV = Number(masterCosting?.[k] || -1);
            // console.log(".....", mV);
            if (!v && mV > -1) {
                // console.log([k, v, unit.modelName]);
                costing.costings[k] = mV;
            }
        });
    }
    let name = [
        `BLK${unit.block} LOT${unit.lot} (${unit.modelName})`,
        cost.title == "Default" ? "" : cost.title
    ]
        .filter(Boolean)
        .join(" ");
    if (!unit.jobs.find(j => j.title?.toLowerCase() == name?.toLowerCase())) {
        return {
            id: unit.id,
            name,
            costing
        } as any;
    }
    return null as any;
}
