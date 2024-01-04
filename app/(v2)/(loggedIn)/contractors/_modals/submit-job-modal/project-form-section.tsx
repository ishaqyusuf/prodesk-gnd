import { useJobCostList, useStaticProjects } from "@/_v2/hooks/use-static-data";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { SubmitJobForm } from ".";
import AutoComplete from "@/components/_v1/common/auto-complete";
import useSubmitJob from "./use-submit-job";
import { Projects } from "@prisma/client";
import { useEffect } from "react";
import { HomeJobList } from "@/types/hrm";
import AutoCompleteTw from "@/components/_v1/auto-complete-tw";
export default function ProjectFormSection() {
    const ctx = useSubmitJob();
    const cost = useJobCostList(ctx.type);
    const projects = useStaticProjects();
    const [projectId, homeId, homeList] = ctx.form.watch([
        "job.projectId",
        "job.homeId",
        "homes",
    ]);

    async function projectSelected(e) {
        // console.log(e);
        let project: Projects = e.data as any;
        Object.entries({
            homeId: null,
            "meta.addon": 0,
            "meta.costData": {},
            title: project.title,
            costList: [],
        }).map(([k, v]) => {
            ctx.setValue(`job.${k}` as any, v as any);
        });
        // ctx.setValue('')
    }
    async function homeSelected(e) {
        const home: HomeJobList = e.data as any;
        // console.log(home);
        let costList = cost.data
            ?.map((c) => {
                if (ctx.type == "punchout" || home.costing?.[c.uid]) return c;
                return null;
            })
            .filter(Boolean);
        ctx.setValue("home", home);
        ctx.setValue("job.meta.costData", {} as any);
        ctx.setValue("costList", (costList || []) as any);
    }
    useEffect(() => {
        ctx.projectChanged();
    }, [projectId]);
    useEffect(() => {
        ctx.homeChanged();
    }, [homeId]);
    return (
        <div className="grid grid-cols-2 gap-2">
            <FormField
                name="job.projectId"
                control={ctx.form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Project</FormLabel>
                        <FormControl>
                            {/* <AutoCompleteTw
                                {...field}
                                itemText="title"
                                itemValue="id"
                                options={[
                                    { title: "Custom", id: null },
                                    ...(projects.data || []),
                                ]}
                            /> */}
                            <AutoComplete
                                {...field}
                                itemText={"title"}
                                id={"project"}
                                itemValue={"id"}
                                options={[
                                    { title: "Custom", id: null },
                                    ...(projects.data || []),
                                ]}
                                onSelect={projectSelected}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                name="job.homeId"
                control={ctx.form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                            <AutoComplete
                                {...field}
                                itemText={"name"}
                                id={"unit"}
                                itemValue={"id"}
                                options={[
                                    { title: "Custom", id: null },
                                    ...(homeList || []),
                                ]}
                                onSelect={homeSelected}
                            />
                            {/* <AutoCompleteTw
                                {...field}
                                itemText={"name"}
                                id={"unit"}
                                itemValue={"id"}
                                options={[
                                    { title: "Custom", id: null },
                                    ...(homeList || []),
                                ]}
                                onSelect={homeSelected}
                            /> */}
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
