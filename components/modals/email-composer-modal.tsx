"use client";

import React, { useTransition } from "react";

import { redirect, useRouter } from "next/navigation";
import { ISalesOrder } from "@/types/sales";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import {
    TimelineUpdateProps,
    updateTimelineAction,
} from "@/app/_actions/progress";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { EmailModalProps, EmailProps } from "@/types/email";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { salesShortCodes } from "@/data/short-codes";
import { Badge } from "../ui/badge";
import { sendMessage } from "@/app/_actions/email";
import { Label } from "../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { transformEmail } from "@/lib/email-transform";
import { useSession } from "next-auth/react";

interface Props {
    isProd?: Boolean;
}
export default function EmailComposerModal({ isProd }: Props) {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<EmailProps>({
        defaultValues: {},
    });
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/login");
        },
    });
    async function submit() {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                const isValid = emailSchema.parse(form.getValues());

                await sendMessage({
                    ...form.getValues(),
                });
                closeModal();
                toast.message("Message Sent Succesfully");
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    return (
        <BaseModal<EmailModalProps>
            className="sm:max-w-[550px]"
            onOpen={async (data) => {
                let from = ` From Gnd Millwork<${
                    session?.user?.email?.split("@")?.[0]
                }@gndprodesk.com>`;
                from = session?.user?.name?.split(" ")?.[0] + from;
                form.reset({
                    reply_to: session?.user?.email,
                    to: data.data?.customer?.email,
                    from,
                    subject: "Hello @customer.name",
                    body: "Your order id is @orderId",
                    data: {
                        ...data?.data,
                    },
                });
                setTimeout(() => {
                    // submit();
                }, 2000);
                // form.reset({
                //     to: data?.email?.toEmail, //`${data.to.name}<${data.to.email}>`,
                //     type: data?.email?.type,
                //     data: data?.data,
                //     parentId: data?.email?.parentId,
                //     from: data?.email?.from || "Pablo From GNDPRODESK",
                // });
            }}
            onClose={() => {}}
            modalName="email"
            Title={({ data: order }) => <div>Email Composer</div>}
            Subtitle={({ data: order }) => (
                <div>
                    {order?.data?.orderId} {" | "} {order?.data?.customer?.name}
                </div>
            )}
            Content={({ data: order }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>From</Label>
                            <Input
                                placeholder="Pablo Cruz<pcruz321@gmail.com>"
                                className="h-8"
                                {...form.register("from")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>To Email</Label>
                            <Input className="h-8" {...form.register("to")} />
                        </div>
                        <div className="col-span-2 grid gap-2">
                            <Label>Subject</Label>
                            <Input
                                placeholder="Hello @customer.name"
                                className="h-8"
                                {...form.register("subject")}
                            />
                        </div>
                        <div className="col-span-2 grid gap-2">
                            <Label>Body</Label>
                            <Textarea
                                placeholder="Hello @customer.name, we are writing to inform you about the status of your order @orderId. Total order cost is @grandTotal..."
                                className=""
                                {...form.register("body")}
                            />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-primary">Short Codes</p>
                        <div className="">
                            {salesShortCodes.map((s, index) => (
                                <Badge
                                    className="m-1 p-0.5 font-normal bg-black-300"
                                    key={index}
                                >
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            Footer={({ data }) => (
                <Btn
                    isLoading={isSaving}
                    onClick={() => submit()}
                    size="sm"
                    type="submit"
                >
                    Send
                </Btn>
            )}
        />
    );
}
