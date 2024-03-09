"use client";

import ControlledInput from "@/components/common/controls/controlled-input";
import Modal from "@/components/common/modal";
import Tiptap from "@/components/common/tip-tap";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Controller, useForm } from "react-hook-form";
import { SendEmailTemplateSection } from "./template-helper";

interface Props {
    subject?: string;
    to?: string;
    body?: string;
    parentId?;
    emailType?: "sales";
    subtitle?: string;
}
export default function SendEmailSheet({
    subject,
    to,
    body,
    parentId,
    subtitle,
    emailType,
    ...props
}: Props) {
    const form = useForm({
        defaultValues: {
            subject,
            to,
            body,
            parentId,
            template: {
                title: "",
                id: null,
                html: "",
                type: emailType,
            },
        },
    });

    async function sendEmail() {}
    return (
        <Form {...form}>
            <Modal.Content
                side={"bottomRight"}
                className="sm:max-w-none sm:w-1/2 xl:w-1/3 h-[80vh] rounded-lg m-4 flex flex-col"
            >
                <Modal.Header title="Compose Email" subtitle={subtitle} />
                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <SendEmailTemplateSection />
                        <ControlledInput
                            control={form.control}
                            name="to"
                            label="To"
                        />
                        <ControlledInput
                            control={form.control}
                            name="subject"
                            label="Subject"
                        />
                        <div className="col-span-2">
                            <Tiptap
                                label="Body"
                                control={form.control}
                                name="body"
                                className="flex-1"
                                mentions={["orderId", "customer.name"]}
                            />
                        </div>
                    </div>
                </ScrollArea>
                <Modal.Footer submitText="Send" onSubmit={sendEmail}>
                    <span></span>
                </Modal.Footer>
            </Modal.Content>
        </Form>
    );
}
