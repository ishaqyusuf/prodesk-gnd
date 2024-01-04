"use client";

import BaseModal from "@/components/_v1/modals/base-modal";
import { HomeJobList, IJobs } from "@/types/hrm";
import { useEffect } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { Subtitle, Title } from "./heading";
import useSubmitJob from "./use-submit-job";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SelectUserField from "./select-user-field";
import TaskDetailsTab from "./task-details-tab";
import { InstallCostLine } from "@/types/settings";
import Btn from "@/components/_v1/btn";
import GeneralInfoTab from "./general-info-tab";

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
    return (
        <FormProvider {...form}>
            <BaseModal
                className="sm:max-w-[550px]"
                modalName="submitJobModal"
                Content={ModalContent}
                Footer={ModalFooter}
                Title={Title}
                Subtitle={Subtitle}
            />
        </FormProvider>
    );
}
export interface SubmitJobModalDataProps {
    data: IJobs;
    action: JobFormAction;
}
export interface SubmitJobModalProps {
    data: SubmitJobModalDataProps;
}
function ModalContent({ data }: SubmitJobModalProps) {
    const ctx = useSubmitJob();
    useEffect(() => {
        ctx.initialize(data);
    }, []);
    return (
        <div>
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
        </div>
    );
}
function ModalFooter({ data }: SubmitJobModalProps) {
    const ctx = useSubmitJob();
    return (
        <div className="space-x-4 items-center flex">
            <Btn onClick={ctx.nextTab}>Submit</Btn>
        </div>
    );
}
