"use client";

import ControlledInput from "@/components/common/controls/controlled-input";
import Modal from "@/components/common/modal";
import Tiptap from "@/components/common/tip-tap";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Controller, useForm } from "react-hook-form";
import { SendEmailTemplateSection } from "./template-helper";
import { useEffect, useState } from "react";
import { getEmailData } from "../_actions/get-email-data";
import { ServerPromiseType } from "@/types";
import { useModal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { sendMessage } from "@/app/(v1)/_actions/email";
import { EmailTypes } from "../types";
import { isProdClient } from "@/lib/is-prod";

interface Props {
    // subject?: string;
    // to?: string;
    // body?: string;
    // parentId?;
    // emailType?: "sales";
    subtitle?: string;

    data: {
        to: string;
        parentId: number;
        type: EmailTypes;
    };
}
export default function SendEmailSheet({ subtitle, data }: Props) {
    const form = useForm({
        defaultValues: {
            subject: "",
            body: "",
            ...data,

            template: {
                title: "",
                id: null,
                html: "",
                type: data.type,
            },
        },
    });
    const modal = useModal();
    const [emailData, setEmailData] = useState<
        ServerPromiseType<typeof getEmailData>["Response"]
    >(null as any);
    async function sendEmail() {
        const {
            to,
            subject,
            body,
            parentId,
            template: { type },
        } = form.getValues();
        if (!to && !isProdClient) {
            toast.error("Please enter email address");
            return;
        }
        await sendMessage({
            to,
            subject,
            body,
            parentId,
            type,
            data: emailData.data,
            from: emailData.from,
            meta: {},
            attachOrder: true,
        } as any);
    }
    useEffect(() => {
        getEmailData(data.parentId, data.type).then((resp) => {
            if (resp) {
                setEmailData(resp);
            } else {
                modal.close();
                toast.error("Invalid operation");
            }
        });
    }, []);
    if (!emailData) return null;
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
                                mentions={emailData.suggestions}
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
