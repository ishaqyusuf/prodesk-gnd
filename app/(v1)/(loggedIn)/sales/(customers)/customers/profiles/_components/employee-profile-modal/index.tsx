"use client";

import { _revalidate } from "@/app/(v1)/_actions/_revalidate";

import ControlledInput from "@/components/common/controls/controlled-input";
import Modal from "@/components/common/modal";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ICustomerProfile } from "../type";
import { saveCustomerProfile } from "../actions";
import { useModal } from "@/components/common/modal/provider";
import ControlledSelect from "@/components/common/controls/controlled-select";
import salesData from "@/app/(v2)/(loggedIn)/sales/sales-data";

export default function CustomerProfileModal({
    defaultValues,
}: {
    defaultValues?: Partial<ICustomerProfile>;
}) {
    if (!defaultValues) defaultValues = {};
    if (!defaultValues.meta) defaultValues.meta = {} as any;
    // console.log(defaultValues);

    const id = defaultValues.id;
    const form = useForm<ICustomerProfile>({
        defaultValues,
    });
    const modal = useModal();
    async function submit() {
        const data = form.getValues();
        try {
            console.log(data.coefficient);
            data.coefficient = Number(data.coefficient as any);

            data.meta.goodUntil = Number(data.meta.goodUntil as any);

            await saveCustomerProfile(data);

            toast.message("Success!");
            _revalidate("customerProfiles");
            modal.close();
        } catch (error) {
            toast.message("Invalid Form");
            return;
        }
    }
    return (
        <Form {...form}>
            <Modal.Content>
                <Modal.Header title={`${id ? "Update" : "Create"} Profile`} />
                <div className="grid gap-4 grid-cols-2">
                    <ControlledInput
                        control={form.control}
                        name={"title"}
                        className="col-span-2"
                        label="Profile Name"
                    />
                    <ControlledInput
                        control={form.control}
                        name={"coefficient"}
                        label="Sales Margin (%)"
                        type="number"
                    />
                    <ControlledInput
                        control={form.control}
                        name={"meta.goodUntil"}
                        label="Quote Good Until (days)"
                        type="number"
                    />
                    <ControlledSelect
                        control={form.control}
                        name={"meta.net"}
                        options={salesData.paymentTerms}
                        label="Sales Payment Term"
                    />
                </div>
                <Modal.Footer onSubmit={submit} />
            </Modal.Content>
        </Form>
    );
}
