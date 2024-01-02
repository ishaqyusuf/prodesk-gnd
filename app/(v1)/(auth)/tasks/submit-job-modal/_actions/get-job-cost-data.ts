"use server";

import { prisma } from "@/db";
import { deepCopy } from "@/lib/deep-copy";
import {
    ExtendedHome,
    HomeTemplateMeta,
    ICommunityPivotMeta,
    ICommunityTemplate,
    ICommunityTemplateMeta,
    IHome,
    IHomeTemplate,
    IProject,
    InstallCost,
    InstallCosting,
} from "@/types/community";
import { HomeJobList, IJobMeta, IJobType } from "@/types/hrm";

export async function getJobCostData(id, title) {
    const home = await prisma.homes.findUnique({
        where: { id },
        include: {
            // homeTemplate: true
            communityTemplate: {
                include: {
                    pivot: true,
                },
            },
        },
    });
    const template: ICommunityTemplateMeta = home?.communityTemplate
        ?.meta as any;
    let p: ICommunityPivotMeta = home?.communityTemplate?.pivot?.meta as any;
    if (p) {
        return p.installCost || {};
        let spl = title?.split(")")[1]?.trim();
        if (!spl) spl = "Default";
        // return template.installCosts;
        return (
            template.installCosts
                ?.map((i) => {
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
