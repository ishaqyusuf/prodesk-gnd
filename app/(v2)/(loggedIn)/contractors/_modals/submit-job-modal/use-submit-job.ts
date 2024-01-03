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

export default function useSubmitJob() {
    const form = useSubmitJobForm();
    const [id, type, data, tab, action] = form.watch([
        "job.id",
        "job.type",
        "data",
        "tab",
        "action",
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
