"use client";

import { saveSettingAction } from "@/app/(v1)/_actions/settings";
import { ISalesSetting } from "@/types/post";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import GeneralSettings from "./GeneralSettings";
import DoorWizardSettings from "./DoorWizard";
import Btn from "@/components/_v1/btn";
import { loadStaticList } from "@/store/slicers";

import { useAppSelector } from "@/store";
import { getStaticEmployeeProfiles } from "@/app/(v1)/_actions/hrm/employee-profiles";
import SalesCommisionSettingSection from "./sales-commision";

export default function SalesSettings({ data }) {
    const defaultValues: ISalesSetting = {
        ...data,
    } as any;
    const form = useForm<ISalesSetting>({
        defaultValues,
    });
    const profiles = useAppSelector((s) => s.slicers.staticEmployeeProfiles);
    useEffect(() => {
        loadStaticList(
            "staticCustomerProfiles",
            profiles,
            getStaticEmployeeProfiles
        );
    }, []);
    const [isPending, startTransition] = useTransition();
    async function save() {
        startTransition(async () => {
            const value = form.getValues();
            const resp = await saveSettingAction(value.id, {
                meta: value.meta,
            });
            toast.success("Saved!");
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Btn isLoading={isPending} onClick={save} className="h-8">
                    Save
                </Btn>
            </div>
            <GeneralSettings form={form} />
            <SalesCommisionSettingSection form={form} />
            <DoorWizardSettings form={form} />
            <div className="flex justify-end">
                <Btn isLoading={isPending} onClick={save} className="h-8">
                    Save
                </Btn>
            </div>
        </div>
    );
}
