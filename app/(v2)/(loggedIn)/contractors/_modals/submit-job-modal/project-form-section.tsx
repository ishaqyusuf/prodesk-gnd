import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import AutoComplete from "@/components/_v1/common/auto-complete";
import { Projects } from "@prisma/client";
import { useEffect } from "react";
import { HomeJobList } from "@/types/hrm";
import { deepCopy } from "@/lib/deep-copy";
import { InstallCostLine } from "@/types/settings";
import { useJobSubmitCtx } from "./use-submit-job";
export default function ProjectFormSection({}) {
    const ctx = useJobSubmitCtx();

    const [projectId, homeId, homeList] = ctx.form.watch([
        "job.projectId",
        "job.homeId",
        "homes",
    ]);

    async function projectSelected(e) {
        // console.log(e);
        let project: Projects = e.data as any;
        // console.log("REMOVE COST LISTS");
        ctx.costList.remove();
        ctx.setCostList2([]);
        Object.entries({
            homeId: null,
            "meta.addon": 0,
            "meta.costData": {},
            title: project.title,
            subtitle: "",
            // costList: [],
        }).map(([k, v]) => {
            ctx.setValue(`job.${k}` as any, v as any);
        });
        // ctx.setValue('')
    }
    async function homeSelected(e) {
        const home: HomeJobList = e.data as any;
        // console.log(home);
        const cData = {};
        let cl = deepCopy<InstallCostLine[]>(
            ctx?.cost
                ?.map((c) => {
                    if (ctx.type == "punchout" || home.costing?.[c.uid]) {
                        cData[c.uid] = {
                            cost: c.cost,
                        };
                        return c;
                    }
                    return null;
                })
                .filter(Boolean) || []
        );
        ctx.setValue("home", home);
        ctx.setValue("job.meta.costData", cData as any);
        ctx.setValue("job.subtitle", home.name);
        // console.log(costList, cost.data?.length);
        ctx.costList.append(cl as any);
        // ctx.setValue("costList", (costList || []) as any);
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
                                    ...(ctx?.projects?.data || []),
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
