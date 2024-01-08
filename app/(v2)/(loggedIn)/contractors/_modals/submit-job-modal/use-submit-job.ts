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
import { useState } from "react";
import { InstallCostLine } from "@/types/settings";
import { useValidateTaskQty } from "./use-validate-task-qty";
import submitJobUtils from "@/app/(v1)/(auth)/tasks/submit-job-modal/submit-job-utils";
import {
    createJobAction,
    updateJobAction,
} from "@/app/(v1)/_actions/hrm-jobs/create-job";
import { toast } from "sonner";
import { closeModal } from "@/lib/modal";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";

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
    const taskValidation = useValidateTaskQty();
    const path = usePathname();
    const isAdmin = path.includes("contractor/jobs");
    const tabHistory = useFieldArray({
        control: form.control,
        name: "tabHistory",
    });
    const costList = useFieldArray({
        control: form.control,
        name: "costList",
    });
    const [costList2, setCostList2] = useState<InstallCostLine[]>([]);

    async function submit() {
        const { job } = form.getValues();
        job.meta.taskCost = submitJobUtils.totalTaskCost(job.meta.costData);
        // console.log(job.meta.taskCost);
        // if(!job.id)
        job.amount = 0;
        [job.meta.addon, job.meta.taskCost, job.meta.additional_cost].map(
            (n) => n > 0 && (job.amount += Number(n))
        );
        if (job.coWorkerId) job.amount /= 2;
        if (!job.id) await createJobAction(job as any);
        else await updateJobAction(job as any);
        toast.message("Success!");
        closeModal();
        await _revalidate(isAdmin ? "jobs" : "my-jobs");
    }
    return {
        id,
        form,
        costList2,
        setCostList2,
        tab,
        isAdmin,
        costList,
        tabHistory,
        action,
        data: data || {},
        getValues: form.getValues,
        setValue: form.setValue,
        homes,
        type,
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
                    if (taskValidation.validate()) nextTab = "general";
                    break;
                case "general":
                    submit();
            }
            if (nextTab) {
                tabHistory.prepend({ title: tab });
                form.setValue("tab", nextTab);
            }
        },
        async projectChanged() {
            // console.log(projectId);
            form.setValue("job.homeId", null as any);
            const unitJobs = await getUnitJobs(projectId, type);
            // console.log(unitJobs);

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
    let job: IJobs = {
        ...data.data,
    } as any;
    let tab: SubmitJobTabs = "general";
    if ((isAdmin && !data?.data?.id) || data.action == "change-worker")
        tab = "user";
    else {
        if (!data?.data?.id) tab = "tasks";
    }
    form.reset({
        tabHistory: [],
        // costList: [],
        ...data,
        job: job,
        tab,
        // initialized: true,
    });
}