"use client";

import {
  saveCommunityTemplateDesign,
  saveHomeTemplateDesign,
} from "@/app/_actions/community/home-template";
import Btn from "@/components/btn";
import PageHeader from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeTemplateDesign, IHomeTemplate } from "@/types/community";
import { useTransition } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import {
  BifoldDoorForm,
  DecoForm,
  DoubleDoorForm,
  ExteriorFrame,
  GarageDoorForm,
  InteriorDoorForm,
  LockHardwareForm,
} from "./model-sections";
import { toast } from "sonner";
import { useAppSelector } from "@/store";

interface Props {
  data: IHomeTemplate;
}
export interface ModelFormProps {
  form: UseFormReturn<DesignTemplateForm, any, undefined>;
}
export interface DesignTemplateForm extends HomeTemplateDesign {
  ctx: {
    print;
  };
}
export default function ModelForm({ data }: Props) {
  // console.log(data);
  const community = useAppSelector(
    (s) => s.slicers.dataPage?.data?.community
  ) as any;
  const form = useForm<DesignTemplateForm>({
    defaultValues: {
      ...(data?.meta?.design || {}),
    },
  });

  const [isSaving, startTransition] = useTransition();
  function save() {
    startTransition(async () => {
      await (community ? saveCommunityTemplateDesign : saveHomeTemplateDesign)(
        data.slug,
        {
          ...((data?.meta || {}) as any),
          design: form.getValues(),
        }
      );
      toast.success("Saved successfully!");
    });
  }
  return (
    <div id="unitModelForm">
      <PageHeader
        title={"Edit Model"}
        subtitle={``}
        Action={() => (
          <>
            <Btn isLoading={isSaving} onClick={save}>
              Save
            </Btn>
          </>
        )}
      />
      <Tabs defaultValue="interior" className="space-y-4 ">
        <TabsList>
          <TabsTrigger value="exterior">Exterior Frame</TabsTrigger>
          <TabsTrigger value="interior">Interior Trim</TabsTrigger>
          <TabsTrigger value="lock">Lock & Hardware</TabsTrigger>
          <TabsTrigger value="deco">Deco Shutters</TabsTrigger>
        </TabsList>
        <TabsContent value="exterior" className="space-y-4">
          <ExteriorFrame form={form} />
        </TabsContent>
        <TabsContent value="interior" className="space-y-4">
          <GarageDoorForm form={form} />
          <InteriorDoorForm form={form} />
          <DoubleDoorForm form={form} />
          <BifoldDoorForm form={form} />
        </TabsContent>
        <TabsContent value="lock">
          <LockHardwareForm form={form} />
        </TabsContent>
        <TabsContent value="deco">
          <DecoForm form={form} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
