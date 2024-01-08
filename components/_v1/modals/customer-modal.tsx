"use client";

import React, { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { emailSchema } from "@/lib/validations/email";
import { ICustomer } from "@/types/customers";
import { CustomerTypes } from "@prisma/client";
import { saveCustomer } from "@/app/(v1)/_actions/sales/sales-customers";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { ArrowLeft } from "lucide-react";

import { updateCustomerAction } from "@/app/(v1)/_actions/sales/customer.crud";
import { staticCustomerProfilesAction } from "@/app/(v1)/_actions/sales/sales-customer-profiles";
import refresh from "@/lib/refresh";

export default function CustomerModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<ICustomer>({
        defaultValues: {},
    });
    const [profiles, setProfiles] = useState<CustomerTypes[]>([]);
    async function submit() {
        startTransition(async () => {
            // if(!form.getValues)
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
                closeModal();
                toast.message("Saved!");
                refresh();
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    const watchProfileId = form.watch("customerTypeId");

    async function init(data) {
        form.reset(
            !data
                ? {}
                : {
                      ...data,
                  }
        );
        setProfiles([
            { id: -1, title: "New Profile" },
            ...(await staticCustomerProfilesAction()),
        ] as any);
    }
    return (
        <BaseModal<ICustomer | undefined, any>
            className="sm:max-w-[550px]"
            onOpen={(data) => {
                init(data);
            }}
            onClose={() => {}}
            modalName="customerForm"
            Title={({ data: order }) => <div>Customer Form</div>}
            Content={({ data: order }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label>Business Name</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("businessName")}
                            />
                        </div>
                        <div className="grid gap-2 col-span-2">
                            <Label>Name</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("name")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                className="h-8"
                                {...form.register("email")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Phone No</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("phoneNo")}
                            />
                        </div>

                        {watchProfileId != -1 ? (
                            <div className="grid gap-2 col-span-2">
                                <Label>Account Profile</Label>
                                <Select
                                    onValueChange={(value) => {
                                        form.setValue(
                                            "customerTypeId",
                                            Number(value)
                                        );
                                    }}
                                    value={`${form.getValues(
                                        "customerTypeId"
                                    )}`}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            {profiles?.map((profile, _) => (
                                                <SelectItem
                                                    key={_}
                                                    value={`${profile.id}`}
                                                >
                                                    {profile.title}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-2 grid-cols-6 items-end">
                                    <div className="">
                                        <Button
                                            onClick={() =>
                                                form.setValue(
                                                    "customerTypeId",
                                                    null
                                                )
                                            }
                                            className="h-8 w-8 p-0"
                                            variant="ghost"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-2 col-span-5">
                                        <Label>Sales Margin</Label>
                                        <Input
                                            placeholder=""
                                            className="h-8"
                                            {...form.register(
                                                "profile.coefficient"
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Profile Title</Label>
                                    <Input
                                        placeholder=""
                                        className="h-8"
                                        {...form.register("profile.title")}
                                    />
                                </div>
                            </>
                        )}
                        <div className="grid gap-2">
                            <Label>Address</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("primaryAddress.address1")}
                            />
                        </div>
                        <div className="grid gap-2 ">
                            <Label>State</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("primaryAddress.state")}
                            />
                        </div>
                        <div className="grid gap-2 ">
                            <Label>City</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("primaryAddress.city")}
                            />
                        </div>
                        <div className="grid gap-2 ">
                            <Label>Zip Code</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register(
                                    "primaryAddress.meta.zip_code"
                                )}
                            />
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
                    Save
                </Btn>
            )}
        />
    );
}
