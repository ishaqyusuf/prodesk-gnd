import { useStaticProjects } from "@/_v2/hooks/use-static-data";
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
export default function ProjectFormSection() {
    const ctx = useSubmitJob();
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
            "meta.costData": null,
            title: project.title,
        }).map(([k, v]) => {
            ctx.setValue(`job.${k}` as any, v as any);
        });
        // ctx.setValue('')
    }
    async function homeSelected(e) {
        const home: HomeJobList = e.data as any;
    }
    useEffect(() => {
        ctx.projectChanged();
    }, [projectId]);
    useEffect(() => {
        ctx.homeChanged();
    }, [homeId]);
    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="">
                <FormField
                    name="job.projectId"
                    control={ctx.form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Project {projects.data?.length}
                            </FormLabel>
                            <FormControl>
                                <AutoComplete
                                    {...field}
                                    itemText={"title"}
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
                                    itemText={"title"}
                                    itemValue={"id"}
                                    options={[
                                        { title: "Custom", id: null },
                                        ...(ctx.homes || []),
                                    ]}
                                    onSelect={homeSelected}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
