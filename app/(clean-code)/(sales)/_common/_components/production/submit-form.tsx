import { Label } from "@/components/ui/label";
import { LineItemOverview } from "../../data-access/dto/sales-item-dto";
import { useSalesItem } from "./item-production-card";
import { useAssignment } from "./item-assignments";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import FormInput from "@/components/common/controls/form-input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SubmitForm() {
    // const ctx = useSalesItem();
    const ctx = useAssignment();
    const form = ctx.form;
    return (
        <div className="border-b py-2 sm:flex gap-4">
            <Label className="font-mono">Submit Assignment</Label>
            <div className="flex-1">
                <Form {...form}>
                    <div className="">
                        <QtyInput label="lh Qty" />
                        <QtyInput label="rh Qty" />
                        <QtyInput label="qty" />
                    </div>
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full text-start"
                            >
                                <div className="flex  w-full items-center">
                                    <span>Note</span>
                                    <div className="flex-1"></div>
                                    <span>
                                        <ChevronsUpDown className="size-4" />
                                    </span>
                                </div>
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="py-2">
                            <FormInput
                                type="textarea"
                                control={form.control}
                                name="note"
                            />
                        </CollapsibleContent>
                    </Collapsible>

                    <div className="flex justify-end">
                        <Button>Submit</Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
function QtyInput({ label }) {
    const qtyKey = label?.split(" ")?.[0];
    const qtyFormKey = label?.split(" ")?.join("");

    const ctx = useAssignment();
    const submitable = ctx.assignment?.pending?.[qtyKey];
    console.log({ qtyKey, submitable, a: ctx.assignment?.pending });
    const qty = ctx.form.watch(qtyFormKey);
    if (!submitable) return null;
    return (
        <div className="flex justify-end gap-4">
            <Label className="font-mono uppercase">{label}</Label>
            <div className="flex items-end w-auto">
                <Button size="xs" variant="link">
                    -
                </Button>
                <Input
                    onKeyDown={(e) => {
                        console.log(e);
                    }}
                    onBlur={(e) => {
                        console.log(e);
                    }}
                    defaultValue={qty}
                    className="border-0 border-b w-16 "
                    inputMode="numeric"
                    type="number"
                />
                <Button size="xs" variant="link">
                    +
                </Button>
            </div>
        </div>
    );
}
