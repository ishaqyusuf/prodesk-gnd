"use client";

import React, { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import BaseSheet from "./base-sheet";
import { IJobPayment, IJobs } from "@/types/hrm";
import { Info } from "../info";
import {
    DateCellContent,
    PrimaryCellContent,
    SecondaryCellContent
} from "../columns/base-columns";
import Money from "../money";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { getSettingAction } from "@/app/_actions/settings";
import { InstallCostLine, InstallCostSettings } from "@/types/settings";
import { Button } from "../ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "../ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DesignTemplateForm,
    ModelFormProps,
    UnitTemplateTabs
} from "../forms/model-form/model-form";
import { openModal } from "@/lib/modal";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { searchImport } from "@/app/_actions/community/_template-import";
import { useForm } from "react-hook-form";
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandList
} from "../ui/command";
export default function ImportModelTemplateSheet({
    form,
    data
}: ModelFormProps) {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    useEffect(() => {
        setQuery(data?.modelName || "");
    }, []);
    const [result, setResult] = useState<any>([]);
    const [query, setQuery] = React.useState("");

    const debouncedQuery = useDebounce(query, 300);
    async function search() {
        // console.log(data);
        console.log("searching", query);
        const _res = await searchImport(
            query,
            data?.id,
            (data as any)?.projectId
        );
        console.log(_res);
        // console.log(data?.modelName);
        setResult(_res);
    }
    React.useEffect(() => {
        search();
    }, [debouncedQuery]);

    async function init(data) {}
    return (
        <>
            <Button
                size="sm"
                variant="outline"
                onClick={() => openModal("importModelTemplate")}
            >
                Catalog
            </Button>
            <BaseSheet<IJobPayment>
                className="w-full sm:max-w-[550px]"
                onOpen={data => {
                    init(data);
                }}
                onClose={() => {}}
                modalName="importModelTemplate"
                Title={({ data }) => <div>Import Model</div>}
                Description={({ data }) => (
                    <div className="flex justify-between"></div>
                )}
                Content={({ data }) => (
                    <div>
                        {/* <div>
                            <Input
                                placeholder="Search Model"
                                // {...form2.register("q")}
                                value={form2.getValues("q")}
                                // onChange={}
                                onChange={e => {
                                    // setQuery(e.target.value);
                                    form2.setValue("q", e.target.value);
                                }}
                            />
                        </div> */}
                        <Command
                            shouldFilter={false}
                            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                        >
                            <div>
                                <CommandInput
                                    placeholder="Search catalog..."
                                    value={query}
                                    onValueChange={e => {
                                        setQuery(e);
                                    }}
                                />
                            </div>
                            <CommandList className=" ">
                                <ScrollArea className="max-h-none h-[80vh]">
                                    <CommandGroup
                                        key={`prod-`}
                                        className="capitalize  text-base text-primary"
                                    >
                                        <Accordion type="single" collapsible>
                                            {result?.map(template => (
                                                <AccordionItem
                                                    key={template.id}
                                                    value={template.id}
                                                >
                                                    <AccordionTrigger>
                                                        <p>
                                                            {" "}
                                                            {template.modelName}
                                                        </p>
                                                        <p>
                                                            {
                                                                template.project
                                                                    ?.title
                                                            }
                                                        </p>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <TemplateOverview
                                                            data={template}
                                                        />
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </CommandGroup>
                                </ScrollArea>
                            </CommandList>
                        </Command>
                        {/* <ScrollArea className="h-screen ">
                            <div className="grid   items-start   text-sm mt-6 mb-28">
                                <Accordion type="single" collapsible>
                                    {result?.map(template => (
                                        <AccordionItem
                                            key={template.id}
                                            value={template.id}
                                        >
                                            <AccordionTrigger>
                                                {template.modelName}
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                Yes. It adheres to the WAI-ARIA
                                                design pattern.
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </ScrollArea> */}
                    </div>
                )}
                //   Footer={({ data }) => (
                //     <Btn
                //       isLoading={isSaving}
                //       onClick={() => submit()}
                //       size="sm"
                //       type="submit"
                //     >
                //       Save
                //     </Btn>
                //   )}
            />
        </>
    );
}
function TemplateOverview({ data }) {
    const form = useForm<DesignTemplateForm>({
        defaultValues: {
            ...(data?.meta?.design || {}),
            ctx: {
                print: true
            }
        }
    });
    return <UnitTemplateTabs form={form} />;
}
