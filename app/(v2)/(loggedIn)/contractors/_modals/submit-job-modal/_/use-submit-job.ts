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
import { getUnitJobs } from "../../../_actions/get-unit-jobs";
import { useValidateTaskQty } from "./use-validate-task-qty";

import {
    createJobAction,
    updateJobAction,
} from "@/app/(v1)/_actions/hrm-jobs/create-job";
import { toast } from "sonner";
import { closeModal } from "@/lib/modal";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { useStaticProjects } from "@/_v2/hooks/use-static-data";
import { createContext, useContext, useState, useTransition } from "react";
import { getJobCostList } from "../../../_actions/job-cost-list";
import { useModal } from "@/components/common/modal-old/provider";
import submitJobUtils from "./submit-job-utils";

export const JobSubmitContext = createContext<any>({});
export const useJobSubmitCtx = () => useContext(JobSubmitContext);
export default function useSubmitJob(form) {
    const modal = useModal();
    // const form = useSubmitJobForm();
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
    const taskValidation = useValidateTaskQty(form);
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
    const [isLoading, startTransition] = useTransition();
    async function submit() {
        startTransition(async () => {
            try {
                const { job } = form.getValues();
                job.meta.taskCost = submitJobUtils.totalTaskCost(
                    job.meta.costData
                );
                // console.log(job.meta.taskCost);
                // if(!job.id)
                job.amount = 0;
                if (!job.homeId) job.meta.addon = 0;
                [
                    job.meta.addon,
                    job.meta.taskCost,
                    job.meta.additional_cost,
                ].map((n) => n > 0 && (job.amount += Number(n)));
                if (job.coWorkerId) job.amount /= 2;
                if (!job.id) await createJobAction(job as any);
                else await updateJobAction(job as any);
                toast.message("Success!");
                // closeModal();
                modal?.close();
                await _revalidate(isAdmin ? "jobs" : "my-jobs");
            } catch (error) {
                if (error instanceof Error) toast.error(error.message);
            }
        });
    }
    const [cost, setCosts] = useState([]);

    function _initialize(
        _job: IJobs,
        // form: UseFormReturn<SubmitJobForm>,
        { isAdmin, action }
    ) {
        let job: IJobs = {
            ..._job,
        } as any;
        const tabHistory = [];

        let tab: SubmitJobTabs = "general";
        if ((isAdmin && !_job?.id) || action == "change-worker") tab = "user";
        else {
            if (!_job?.id) tab = "tasks";
        }
        if (_job.id) {
            if (tab != "user") tabHistory.unshift({ title: "user" });
            if (tab == "general") tabHistory.unshift({ title: "tasks" });
        }

        form.reset({
            tabHistory,
            // costList: [],
            ..._job,
            job: job,
            tab,
            // initialized: true,
        });
    }

    return {
        isLoading,

        id,
        form,
        // costList2,
        // setCostList2,
        tab,
        isAdmin,
        costList,
        cost,
        tabHistory,
        action,
        data: data || {},
        getValues: form.getValues,
        setValue: form.setValue,
        homes,
        type,
        async initialize(_data: IJobs, action) {
            _initialize(_data, { isAdmin, action });
            const _costs = await getJobCostList(_data?.type);
            // console.log(_data?.type, _costs);
            setCosts(_costs as any);
        },
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
            console.log(unitJobs);

            if (type == "installation" && !id)
                form.setValue("job.meta.addon", (unitJobs?.addon || 0) as any);
            form.setValue("homes", unitJobs.homeList);
        },
        homeChanged() {},
    };
}
