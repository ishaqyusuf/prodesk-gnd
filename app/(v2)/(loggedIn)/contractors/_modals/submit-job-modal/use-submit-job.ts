import { IJobs } from "@/types/hrm";
import {
    SubmitJobForm,
    SubmitJobTabs,
    SubmitJobModalProps,
    useSubmitJobForm,
    SubmitJobModalDataProps,
} from ".";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { usePathname } from "next/navigation";
import { getUnitJobs } from "../../_actions/get-unit-jobs";

export default function useSubmitJob() {
    const form = useSubmitJobForm();
    const [id, type, data, tab, action] = form.watch([
        "job.id",
        "job.type",
        "data",
        "tab",
        "action",
    ]);
    const [projectId, homeId, homes] = form.watch([
        "job.projectId",
        "job.homeId",
        "homes",
    ]);
    const path = usePathname();
    const isAdmin = path.includes("contractor/jobs");
    const tabHistory = useFieldArray({
        control: form.control,
        name: "tabHistory",
    });
    return {
        id,
        form,
        tab,
        isAdmin,
        tabHistory,
        action,
        data: data || {},
        getValues: form.getValues,
        setValue: form.setValue,
        homes,
        initialize: (_data: SubmitJobModalDataProps) =>
            initialize(_data, form, isAdmin),
        nextTab() {
            let nextTab: SubmitJobTabs = null as any;
            switch (tab) {
                case "user":
                    if (type == "Deco-Shutter") nextTab = "general";
                    else nextTab = "tasks";
                    break;
                case "tasks":
                    nextTab = "general";
                    break;
            }
            if (nextTab) {
                tabHistory.prepend({ title: tab });
                form.setValue("tab", nextTab);
            }
        },
        async projectChanged() {
            console.log(projectId);
            form.setValue("job.homeId", null as any);
            const unitJobs = await getUnitJobs(projectId, type);
            console.log(unitJobs);

            if (type == "installation" && !id)
                form.setValue("job.meta.addon", (unitJobs?.addon || 0) as any);
            form.setValue("homes", unitJobs.homeList);
        },
        homeChanged() {},
    };
}
function initialize(
    data: SubmitJobModalDataProps,
    form: UseFormReturn<SubmitJobForm>,
    isAdmin
) {
    let job: IJobs = {} as any;
    let tab: SubmitJobTabs = "general";
    if ((isAdmin && !data?.data?.id) || data.action == "change-worker")
        tab = "user";

    form.reset({
        tabHistory: [],
        ...data,
        job: job,
        tab,
    });
}
