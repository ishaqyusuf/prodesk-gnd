"use client";

import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getEmailTemplates } from "../_actions/get-template";
import { saveEmailTemplate } from "../_actions/save-template";
import { toast } from "sonner";
import { htmlIsEmpty } from "@/lib/utils";

export function SendEmailTemplateSection() {
    const form = useFormContext();
    const templateId = form.watch("template.id");
    const [tab, setTab] = useState<"default" | "edit" | "new">("default");
    const [templates, setTemplates] = useState<any>([]);
    function init() {
        getEmailTemplates(form.getValues("template.type")).then((data) => {
            setTemplates([
                { title: "New", id: -1, subject: "", html: "" },
                ...data,
            ]);
        });
    }
    useEffect(() => {
        init();
    }, []);
    useEffect(() => {
        // console.log(templateId);
        setTab(
            templateId > 0 ? "default" : templateId == -1 ? "new" : "default"
        );
        const t = templates.find((t) => t.id == templateId);
        if (t) {
            form.setValue("template.title", t.id == -1 ? "" : t.title);
            form.setValue("subject", t.subject);
            form.setValue("body", t.html);
        }
    }, [templateId]);
    function resetTemplateForm() {
        form.setValue("template", {
            title: "",
            id: null,
            html: "",
            type: form.getValues("template.type"),
        });
    }
    async function saveTemplate() {
        const {
            subject,
            body,
            template: { id, title, html, type },
        } = form.getValues();
        if (!title) {
            toast.error("Template title required");
            return;
        }

        // console.log(body);
        if (htmlIsEmpty(body)) {
            toast.error("Email body cannot be empty");
            return;
        }
        const res = await saveEmailTemplate(id > 0 ? id : null, {
            html: body,
            type,
            title,
            subject,
            status: "active",
        });
        form.setValue("template.id", res.id);
        init();
        toast.success("Saved");
        setTab("default");
    }
    return (
        <div className="col-span-2">
            <Tabs className="" value={tab}>
                <TabsContent
                    className="flex focus:outline-none items-end gap-2"
                    value="default"
                >
                    <ControlledSelect
                        control={form.control}
                        options={templates}
                        titleKey="title"
                        valueKey="id"
                        name="template.id"
                        className="flex-1"
                        label="Template"
                    />
                    <div className="flex space-x-2">
                        <Button
                            onClick={() => {
                                resetTemplateForm();
                                setTab("new");
                            }}
                            size={"sm"}
                        >
                            Create Template
                        </Button>
                        {templateId > 0 && tab != "new" && (
                            <Button
                                onClick={() => {
                                    setTab("new");
                                }}
                                size={"sm"}
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                </TabsContent>
                <TabsContent className="flex items-end gap-2" value="new">
                    {/* <ControlledSelect
                        control={form.control}
                        options={templates}
                        name="templateId"
                        titleKey="title"
                        valueKey="id"
                        className="flex-1"
                        label="Template"
                    /> */}
                    <ControlledInput
                        control={form.control}
                        name="template.title"
                        className="flex-1"
                        label="Template Title"
                    />
                    <div className="flex space-x-2">
                        <Button
                            onClick={saveTemplate}
                            size={"sm"}
                            className="bg-green-600"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => {
                                resetTemplateForm();
                                setTab("default");
                            }}
                            size={"sm"}
                            className="bg-red-500"
                        >
                            Cancel
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
