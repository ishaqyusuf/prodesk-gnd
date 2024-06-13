"use client";

import {
    useCustomerProfiles,
    useStaticRoles,
} from "@/_v2/hooks/use-static-data";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import {
    createEmployeeAction,
    saveEmployeeAction,
} from "@/app/(v1)/_actions/hrm/save-employee";
import { staticRolesAction } from "@/app/(v1)/_actions/hrm/static-roles";

import ControlledAutoComplete from "@/components/common/controls/controlled-auto-complete";
import ControlledInput from "@/components/common/controls/controlled-input";

import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import { Form } from "@/components/ui/form";
import { employeeSchema } from "@/lib/validations/hrm";
import { IUser } from "@/types/hrm";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateCustomerAction } from "../../../../_actions/customer.crud";
import { ICustomer } from "@/types/customers";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { saveCustomer } from "../../../_actions/sales-customers";

interface Props {
    defaultData?;
}
export default function CustomerFormModal({ defaultData }: Props) {
    const form = useForm<ICustomer>({
        defaultValues: {
            ...defaultData,
        },
    });
    // const watchProfileId = form.watch("customerTypeId");
    const modal = useModal();
    const profiles = useCustomerProfiles();

    async function submit() {
        try {
            // const isValid = emailSchema.parse(form.getValues());
            const data = form.getValues();
            if (!data.id)
                await saveCustomer({
                    ...data,
                });
            else
                await updateCustomerAction({
                    ...data,
                });
            modal.close();
            toast.message("Saved!");
            _revalidate("customers");
        } catch (error) {
            console.log(error);
            toast.message("Invalid Form");
            return;
        }
    }
    return (
        <Form {...form}>
            <Modal.Content>
                <Modal.Header title="Customer Form" />
                <div className="grid gap-2 sm:grid-cols-2">
                    <ControlledInput
                        control={form.control}
                        name="businessName"
                        size="sm"
                        className="sm:col-span-2"
                        label="Business Name"
                    />
                    <ControlledInput
                        control={form.control}
                        name="name"
                        className="sm:col-span-2"
                        size="sm"
                        label="Name"
                    />

                    <ControlledInput
                        control={form.control}
                        name="email"
                        size="sm"
                        label="Email"
                    />
                    <ControlledInput
                        control={form.control}
                        name="phoneNo"
                        size="sm"
                        label="Phone No"
                    />

                    <ControlledSelect
                        className="sm:col-span-2"
                        control={form.control}
                        name="customerTypeId"
                        size="sm"
                        label="Profile"
                        options={[
                            ...profiles?.data?.map((d) => ({
                                label: d.title,
                                value: d.id,
                            })),
                        ]}
                    />
                    <ControlledInput
                        control={form.control}
                        name="primaryAddress.address1"
                        label="Address"
                        size="sm"
                    />
                    <ControlledInput
                        control={form.control}
                        name="primaryAddress.state"
                        label="State"
                        size="sm"
                    />
                    <ControlledInput
                        control={form.control}
                        name="primaryAddress.city"
                        label="City"
                        size="sm"
                    />
                    <ControlledInput
                        control={form.control}
                        name="primaryAddress.meta.zip_code"
                        label="Zip code"
                        size="sm"
                    />
                </div>
                <Modal.Footer onSubmit={submit} />
            </Modal.Content>
        </Form>
    );
}
