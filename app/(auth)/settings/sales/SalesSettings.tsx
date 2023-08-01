"use client";

import { saveSettingAction } from "@/app/_actions/settings";
import { loadCustomerProfiles } from "@/store/actions/customers";
import { ISalesSetting } from "@/types/post";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import GeneralSettings from "./GeneralSettings";
import DoorWizardSettings from "./DoorWizard";
import Btn from "@/components/btn";

export default function SalesSettings({ data }) {
  const defaultValues: ISalesSetting = {
    ...data,
  } as any;
  const form = useForm<ISalesSetting>({
    defaultValues,
  });
  useEffect(() => {
    loadCustomerProfiles();
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
      <GeneralSettings form={form} />
      <DoorWizardSettings form={form} />
      <div className="flex justify-end">
        <Btn isLoading={isPending} onClick={save} className="h-8">
          Save
        </Btn>
      </div>
    </div>
  );
}
