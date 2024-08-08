"use client";

import Btn from "@/components/_v1/btn";
import PageHeader from "@/components/_v1/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeTemplateDesign, IHomeTemplate } from "@/types/community";
import { useEffect, useTransition } from "react";
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
import { loadStaticList } from "@/store/slicers";

import ImportModelTemplateSheet from "@/components/_v1/sheets/import-model-template-sheet";
import { useDataPage } from "@/lib/data-page-context";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { getHomeTemplateSuggestions } from "@/app/(v1)/_actions/community/home-template-suggestion";
import {
    saveCommunityTemplateDesign,
    saveHomeTemplateDesign,
} from "../home-template";

interface Props {
    data: IHomeTemplate;
    title?;
}
export interface ModelFormProps {
    data?: IHomeTemplate;
    form: UseFormReturn<DesignTemplateForm, any, undefined>;
}
export interface DesignTemplateForm extends HomeTemplateDesign {
    ctx: {
        print;
    };
}
export default function ModelForm({ data, title = "Edit Model" }: Props) {
    const {
        data: { community },
    } = useDataPage();
    const form = useForm<DesignTemplateForm>({
        defaultValues: {
            ...(data?.meta?.design || {}),
        },
    });
    const suggestions = useAppSelector((s) => s.slicers.templateFormSuggestion);
    const [isSaving, startTransition] = useTransition();
    useEffect(() => {
        loadStaticList(
            "templateFormSuggestion",
            suggestions,
            getHomeTemplateSuggestions
        );
    }, []);
    async function save() {
        startTransition(async () => {
            await (community
                ? saveCommunityTemplateDesign
                : saveHomeTemplateDesign)(data.slug, {
                ...((data?.meta || {}) as any),
                design: form.getValues(),
            });
            toast.success("Saved successfully!");
            _revalidate("communityTemplate");
        });
    }
    return (
        <div id="unitModelForm">
            <PageHeader
                title={title}
                subtitle={``}
                Action={() => (
                    <>
                        {/* <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                openModal("importModelTemplate");
                            }}
                        >
                            Import
                        </Btn> */}
                        <ImportModelTemplateSheet data={data} form={form} />
                        <Btn size="sm" isLoading={isSaving} onClick={save}>
                            Save
                        </Btn>
                    </>
                )}
            />
            <UnitTemplateTabs form={form} />
        </div>
    );
}

export function UnitTemplateTabs({ form }) {
    return (
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
    );
}
