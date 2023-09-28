"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { ICustomer } from "@/types/customers";
import { CustomerTypes } from "@prisma/client";
import { saveCustomer } from "@/app/_actions/sales/sales-customers";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "../ui/select";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { IProject } from "@/types/community";
import { useAppSelector } from "@/store";
import { loadStaticList } from "@/store/slicers";
import { staticBuildersAction } from "@/app/_actions/community/builders";
import { projectSchema } from "@/lib/validations/community-validations";
import { saveProject } from "@/app/_actions/community/projects";
import { IUser } from "@/types/hrm";
import AutoComplete2 from "../auto-complete";
import { staticRolesAction } from "@/app/_actions/hrm/static-roles";
import { employeeSchema } from "@/lib/validations/hrm";
import {
    createEmployeeAction,
    saveEmployeeAction
} from "@/app/_actions/hrm/save-employee";

export default function EditJobModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<IUser>({
        defaultValues: {}
    });
    async function submit(data) {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                const isValid = employeeSchema.parse(form.getValues());
                if (!data?.id)
                    await createEmployeeAction({
                        ...form.getValues()
                    });
                else
                    await saveEmployeeAction({
                        ...form.getValues()
                    });
                closeModal();
                toast.message("Success!");
                route.refresh();
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    const roles = useAppSelector(state => state?.slicers?.staticRoles);

    async function init(data) {
        loadStaticList("staticRoles", roles, staticRolesAction);

        form.reset(
            !data
                ? {}
                : {
                      ...data
                  }
        );
    }
    return (
        <BaseModal<IUser | undefined>
            className="sm:max-w-[550px]"
            onOpen={data => {
                init(data);
            }}
            onClose={() => {}}
            modalName="editJob"
            Title={({ data }) => (
                <div>
                    {data?.id ? "Edit" : "Create"}
                    {" Employee"}
                </div>
            )}
            Content={({ data }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label>Name</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("name")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Username</Label>
                            <Input
                                className="h-8"
                                {...form.register("username")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                className="h-8"
                                {...form.register("email")}
                            />
                        </div>
                        <div className="grid gap-2 col-span-2">
                            <Label>Role</Label>
                            <AutoComplete2
                                form={form}
                                options={roles}
                                formKey={"role.id"}
                            />
                        </div>
                    </div>
                </div>
            )}
            Footer={({ data }) => (
                <Btn
                    isLoading={isSaving}
                    onClick={() => submit(data)}
                    size="sm"
                    type="submit"
                >
                    Save
                </Btn>
            )}
        />
    );
}
