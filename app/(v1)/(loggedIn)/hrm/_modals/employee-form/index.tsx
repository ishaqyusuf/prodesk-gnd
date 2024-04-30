"use client";

import { useStaticRoles } from "@/_v2/hooks/use-static-data";
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

interface Props {
    defaultData?;
}
export default function EmployeeForm({ defaultData }: Props) {
    const form = useForm<IUser>({
        defaultValues: {
            ...defaultData,
        },
    });
    const modal = useModal();
    const roles = useStaticRoles();
    async function submit() {
        // if(!form.getValues)
        try {
            const isValid = employeeSchema.parse(form.getValues());
            if (!defaultData?.id)
                await createEmployeeAction({
                    ...form.getValues(),
                });
            else
                await saveEmployeeAction({
                    ...form.getValues(),
                });
            await _revalidate("employees");
            toast.message("Success!");
            modal.close();
        } catch (error) {
            console.log(error);
            toast.message("Invalid Form");
            return;
        }
    }
    return (
        <Form {...form}>
            <Modal.Content>
                <Modal.Header title="Employee Form" />

                <div className="grid gap-4">
                    <ControlledInput
                        control={form.control}
                        name="name"
                        label="Name"
                    />
                    <ControlledInput
                        control={form.control}
                        name="username"
                        label="Username"
                    />
                    <ControlledInput
                        control={form.control}
                        name="email"
                        label="Email"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ControlledInput
                            control={form.control}
                            name="phoneNo"
                            label="Phone No"
                        />
                        <ControlledAutoComplete
                            loader={staticRolesAction}
                            control={form.control}
                            name="role.id"
                            titleKey={"name"}
                            valueKey="id"
                            label="Role"
                        />
                    </div>
                </div>
                <Modal.Footer onSubmit={submit} />
            </Modal.Content>
        </Form>
    );
}