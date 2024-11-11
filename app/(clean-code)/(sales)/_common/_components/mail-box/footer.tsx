import { Form } from "@/components/ui/form";
import { useMailbox } from "./context";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledSelect from "@/components/common/controls/controlled-select";
import Button from "@/components/common/button";

export function MailboxFooter({}) {
    const { form, data, __sendEmail } = useMailbox();
    return (
        <Form {...form}>
            <div className="absolute w-full bottom-0 z-10 border-t bg-white p-2 flex-col flex gap-4 sm:p-4">
                <ControlledInput
                    placeholder="type here"
                    type="textarea"
                    control={form.control}
                    name="body"
                    className=""
                />
                <div className="flex">
                    {/* <ControlledCheckbox control={form.control}
                    name="attachment" /> */}
                    <ControlledSelect
                        name="attachment"
                        size="sm"
                        className="w-48"
                        prefix="Attachment"
                        control={form.control}
                        placeholder={"Attachment"}
                        valueKey={"label" as any}
                        titleKey={"label" as any}
                        options={[
                            // "Payment Invoice",
                            { label: "None" },
                            ...data.attachables,
                        ]}
                    />
                    <div className="flex-1"></div>
                    <Button
                        action={__sendEmail}
                        disabled={data?.noEmail}
                        size="sm"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </Form>
    );
}
