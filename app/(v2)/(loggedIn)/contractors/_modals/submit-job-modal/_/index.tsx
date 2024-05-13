"use client";

import BaseModal from "@/components/_v1/modals/base-modal";
import { HomeJobList, IJobs } from "@/types/hrm";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import useSubmitJob, {
    JobSubmitContext,
    useJobSubmitCtx,
} from "./use-submit-job";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SelectUserField from "./select-user-field";
import TaskDetailsTab from "./task-details-tab";
import { InstallCostLine } from "@/types/settings";
import Btn from "@/components/_v1/btn";
import GeneralInfoTab from "./general-info-tab";
import {
    useStaticContractors,
    useStaticProjects,
} from "@/_v2/hooks/use-static-data";
import { useAppSelector } from "@/store";
import { usePathname } from "next/navigation";
import { Form } from "@/components/ui/form";
import { memo } from "react";
import { SubmitJobModalSubtitle, SubmitJobModalTitle } from "./heading";

export type SubmitJobTabs = "project" | "user" | "unit" | "tasks" | "general";
export type JobFormAction = "edit" | "change-worker";

export interface SubmitJobForm {
    job: IJobs;
    data: IJobs;
    tab: SubmitJobTabs;
    action: JobFormAction;
    tabHistory: { title }[];
    homes: HomeJobList[];
    home: HomeJobList;
    costList: InstallCostLine[];
    // initialized: boolean;
}
export const useSubmitJobForm = () => useFormContext<SubmitJobForm>();
export default function SubmitJobModal({}) {
    const defaultValues = {
        // initialized: false,
        costList: [],
    };
    const form = useForm<SubmitJobForm>({
        defaultValues,
    });
    const contractors = useStaticContractors();
    const projects = useStaticProjects();

    const ctx = {
        ...useSubmitJob(form),
        contractors,
        projects,
    };

    return (
        <JobSubmitContext.Provider value={ctx}>
            {/* <FormProvider {...form}> */}
            <BaseModal
                className="sm:max-w-[550px]"
                modalName="submitJobModal"
                Content={memo(ModalContent)}
                Footer={ModalFooter}
                Title={SubmitJobModalTitle}
                Subtitle={SubmitJobModalSubtitle}
                onOpen={(e) => {
                    ctx.initialize(e);
                    // form.reset({
                    //     tabHistory: [],
                    //     tab: "tasks",
                    // });
                }}
            />
            {/* </FormProvider> */}
        </JobSubmitContext.Provider>
    );
}
export interface SubmitJobModalDataProps {
    data: IJobs;
    action: JobFormAction;
}
export interface SubmitJobModalProps {
    data?: SubmitJobModalDataProps;
}
function ModalContent({ data }: SubmitJobModalProps) {
    const ctx = useJobSubmitCtx();

    // useEffect(() => {
    // console.log(">...");
    // ctx.initialize(data);
    // }, []);
    return (
        <Form {...ctx.form}>
            <Tabs value={ctx.tab}>
                <TabsList className="hidden">
                    <TabsTrigger value="user" />
                    <TabsTrigger value="project" />
                    <TabsTrigger value="unit" />
                    <TabsTrigger value="tasks" />
                    <TabsTrigger value="general" />
                </TabsList>
                <TabsContent value="user">
                    <SelectUserField />
                </TabsContent>
                <TabsContent value="tasks">
                    <TaskDetailsTab />
                </TabsContent>
                <TabsContent value="general">
                    <GeneralInfoTab />
                </TabsContent>
            </Tabs>
        </Form>
    );
}
export const SubmitJobModalContent = ModalContent;
function ModalFooter({ data }: SubmitJobModalProps) {
    const ctx = useJobSubmitCtx();
    return (
        <div className="space-x-4 items-center flex">
            <Btn isLoading={ctx.isLoading} onClick={ctx.nextTab}>
                Submit
            </Btn>
        </div>
    );
}
export const SubmitJobModalFooter = ModalFooter;
